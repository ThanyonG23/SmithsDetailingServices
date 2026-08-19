import postgres from "postgres";
import type { Booking } from "./calendar";
import type { AdRow } from "./ads";
import { normName } from "./sales";
import { freshChecklist, type ServiceChecklistItem } from "./service";

/* =====================================================================
   DAILY OPS — data layer (Supabase / any Postgres via the `postgres` client)
   - daily_log : one row per day, what Ashlee logs
   - bookings  : parsed from the uploaded Google Calendar (full snapshot)
   Tables + newer columns are created lazily on first use.
   ===================================================================== */

export interface DailyLogInput {
  log_date: string; // YYYY-MM-DD
  jobs_completed: number;
  revenue_collected: number;
  completed_revenue: number;
  ad_spend: number;
  quotes: number;
  redos: number;
  messages: number; // new leads/enquiries received that day
  staff_hours: Record<string, number>;
  staff_shifts: Record<string, { start: string; end: string }>;
  staff_notes: Record<string, string>;
  notes_today: string;
}

export interface DailyLog extends DailyLogInput {
  updated_at: string; // Cairns-local "YYYY-MM-DDTHH:MM"
}

export type { Booking };
export type { AdRow };

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  "";

const sql = postgres(connectionString, {
  ssl: "require",
  prepare: false,
  // Vercel Fluid Compute runs several requests in ONE instance, so max:1 meant
  // the whole crew fought over a single connection and some requests deadlocked
  // to the timeout. Each request still loads its queries SEQUENTIALLY (never
  // Promise.all — that deadlocks the pooler), so a bigger pool only ever serves
  // one query per connection at a time: concurrent *requests* each get their own.
  max: 8,
  idle_timeout: 20, // recycle idle connections (serverless-friendly)
  connect_timeout: 15, // allow a cold/waking Supabase pooler time to answer (pages cap the overall wait)
});

// Memoise a single in-flight promise so parallel reads on a cold start
// don't each run the schema DDL. Resets on failure so it can retry.
let ensurePromise: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = runEnsure().catch((e) => {
      ensurePromise = null;
      throw e;
    });
  }
  return ensurePromise;
}
async function runEnsure(): Promise<void> {
  // Fast path: if the newest column already exists, the schema is current, so
  // skip all the CREATE/ALTER DDL. This avoids ALTER TABLE lock waits (which
  // can hang a request to the function timeout). Bump the checked column when
  // the schema grows.
  try {
    // Sentinel = the newest TABLE existing (reliably created, unlike an index
    // whose creation is wrapped in a swallowed try). Bump this to the newest
    // table whenever the schema grows so the one-time DDL runs exactly once.
    const rows = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'inspections' AND column_name = 'member'
      ) AS ready;`;
    if ((rows[0] as { ready: boolean } | undefined)?.ready) return;
  } catch {
    /* fall through and run the full setup */
  }

  await sql`
    CREATE TABLE IF NOT EXISTS daily_log (
      log_date            date          PRIMARY KEY,
      bookings            integer       NOT NULL DEFAULT 0,
      jobs_completed      integer       NOT NULL DEFAULT 0,
      revenue_collected   numeric(10,2) NOT NULL DEFAULT 0,
      happy_customers     integer       NOT NULL DEFAULT 0,
      unhappy_customers   integer       NOT NULL DEFAULT 0,
      staff_hours         jsonb         NOT NULL DEFAULT '{}'::jsonb,
      staff_shifts        jsonb         NOT NULL DEFAULT '{}'::jsonb,
      staff_notes         jsonb         NOT NULL DEFAULT '{}'::jsonb,
      notes_today         text          NOT NULL DEFAULT '',
      updated_at          timestamptz   NOT NULL DEFAULT now()
    );
  `;
  await sql`ALTER TABLE daily_log ADD COLUMN IF NOT EXISTS staff_shifts jsonb NOT NULL DEFAULT '{}'::jsonb;`;
  await sql`ALTER TABLE daily_log ADD COLUMN IF NOT EXISTS staff_notes  jsonb NOT NULL DEFAULT '{}'::jsonb;`;
  await sql`ALTER TABLE daily_log ADD COLUMN IF NOT EXISTS ad_spend     numeric(10,2) NOT NULL DEFAULT 0;`;
  await sql`ALTER TABLE daily_log ADD COLUMN IF NOT EXISTS completed_revenue numeric(10,2) NOT NULL DEFAULT 0;`;
  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id            serial        PRIMARY KEY,
      uid           text          NOT NULL DEFAULT '',
      booking_date  date          NOT NULL,
      value         numeric(10,2) NOT NULL DEFAULT 0,
      is_correction boolean       NOT NULL DEFAULT false,
      summary       text          NOT NULL DEFAULT ''
    );
  `;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS uid text NOT NULL DEFAULT '';`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS extras text NOT NULL DEFAULT '';`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS car text NOT NULL DEFAULT '';`;
  // Where the lead came from (the calendar "Referral:" field) — for conversion attribution.
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT '';`;
  // Meta Leads Centre snapshot (uploaded from leads.csv) — ad_id + stage per lead.
  await sql`
    CREATE TABLE IF NOT EXISTS meta_leads (
      id            serial       PRIMARY KEY,
      name          text         NOT NULL DEFAULT '',
      email         text         NOT NULL DEFAULT '',
      phone         text         NOT NULL DEFAULT '',
      source        text         NOT NULL DEFAULT '',
      channel       text         NOT NULL DEFAULT '',
      stage         text         NOT NULL DEFAULT '',
      ad_id         text         NOT NULL DEFAULT '',
      created_date  date,
      loaded_at     timestamptz  NOT NULL DEFAULT now()
    );`;
  // Upsell inspection portal: one row per car inspected, items = JSONB list of
  // recommended extras (photos + price). slug = the public /v/<slug> link.
  await sql`
    CREATE TABLE IF NOT EXISTS inspections (
      id            serial       PRIMARY KEY,
      slug          text         UNIQUE NOT NULL,
      booking_uid   text         NOT NULL DEFAULT '',
      customer_name text         NOT NULL DEFAULT '',
      vehicle       text         NOT NULL DEFAULT '',
      items         jsonb        NOT NULL DEFAULT '[]'::jsonb,
      status        text         NOT NULL DEFAULT 'draft',
      customer_note text         NOT NULL DEFAULT '',
      created_at    timestamptz  NOT NULL DEFAULT now(),
      responded_at  timestamptz
    );`;
  // Member inspections give the customer a discount on every upsell.
  await sql`ALTER TABLE inspections ADD COLUMN IF NOT EXISTS member boolean NOT NULL DEFAULT false;`;
  // Real sales from Xero (SalesInvoices export) — one row per invoice, the
  // source of truth for revenue (vs the calendar price estimate).
  await sql`
    CREATE TABLE IF NOT EXISTS sales (
      invoice_number text         PRIMARY KEY,
      contact_name   text         NOT NULL DEFAULT '',
      contact_norm   text         NOT NULL DEFAULT '',
      email          text         NOT NULL DEFAULT '',
      invoice_date   date,
      total          numeric(10,2) NOT NULL DEFAULT 0,
      status         text         NOT NULL DEFAULT '',
      description    text         NOT NULL DEFAULT '',
      loaded_at      timestamptz  NOT NULL DEFAULT now()
    );`;
  await sql`
    CREATE TABLE IF NOT EXISTS job_hours (
      uid        text          PRIMARY KEY,
      hours      numeric(6,2)  NOT NULL DEFAULT 0,
      updated_at timestamptz   NOT NULL DEFAULT now()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS job_followups (
      uid        text         PRIMARY KEY,
      done       boolean      NOT NULL DEFAULT false,
      updated_at timestamptz  NOT NULL DEFAULT now()
    );
  `;
  // status: 'pending' | 'happy' | 'unhappy' | 'rectified'
  await sql`ALTER TABLE job_followups ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';`;
  await sql`UPDATE job_followups SET status = 'happy' WHERE done = true AND status = 'pending';`;
  await sql`
    CREATE TABLE IF NOT EXISTS stock_items (
      id          serial        PRIMARY KEY,
      category    text          NOT NULL DEFAULT '',
      item        text          NOT NULL DEFAULT '',
      brand       text          NOT NULL DEFAULT '',
      website     text          NOT NULL DEFAULT '',
      unit        text          NOT NULL DEFAULT '',
      min_qty     numeric(10,2) NOT NULL DEFAULT 0,
      current_qty numeric(10,2) NOT NULL DEFAULT 0,
      notes       text          NOT NULL DEFAULT '',
      ordered     boolean       NOT NULL DEFAULT false,
      updated_at  timestamptz   NOT NULL DEFAULT now()
    );
  `;
  await sql`ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS ordered boolean NOT NULL DEFAULT false;`;
  await sql`ALTER TABLE daily_log ADD COLUMN IF NOT EXISTS quotes integer NOT NULL DEFAULT 0;`;
  await sql`ALTER TABLE daily_log ADD COLUMN IF NOT EXISTS redos  integer NOT NULL DEFAULT 0;`;
  await sql`ALTER TABLE daily_log ADD COLUMN IF NOT EXISTS messages integer NOT NULL DEFAULT 0;`;
  // records the first day each booking (by UID) shows up in an upload, so we
  // can count genuinely NEW bookings per day for the leads→bookings funnel.
  await sql`
    CREATE TABLE IF NOT EXISTS booking_seen (
      uid           text          PRIMARY KEY,
      first_seen    date          NOT NULL,
      value         numeric(10,2) NOT NULL DEFAULT 0,
      is_correction boolean       NOT NULL DEFAULT false,
      summary       text          NOT NULL DEFAULT ''
    );
  `;
  // One-time: clear the baseline that got stamped with today's date on the
  // first upload (before baseline handling). Runs only on the messages ->
  // messages_meta upgrade (guard: messages_meta not added yet), never later.
  await sql`
    DELETE FROM booking_seen
    WHERE NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'daily_log' AND column_name = 'messages_meta'
    );
  `;
  await sql`ALTER TABLE daily_log ADD COLUMN IF NOT EXISTS messages_meta integer NOT NULL DEFAULT 0;`;
  await sql`ALTER TABLE daily_log ADD COLUMN IF NOT EXISTS checklist jsonb NOT NULL DEFAULT '[]'::jsonb;`;
  await sql`
    CREATE TABLE IF NOT EXISTS ad_stats (
      id           serial        PRIMARY KEY,
      name         text          NOT NULL DEFAULT '',
      spend        numeric(10,2) NOT NULL DEFAULT 0,
      messages     integer       NOT NULL DEFAULT 0,
      new_contacts integer       NOT NULL DEFAULT 0,
      purchases    integer       NOT NULL DEFAULT 0,
      impressions  integer       NOT NULL DEFAULT 0,
      reach        integer       NOT NULL DEFAULT 0
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      dedupe_key  text          PRIMARY KEY,
      name        text          NOT NULL DEFAULT '',
      phone       text          NOT NULL DEFAULT '',
      email       text          NOT NULL DEFAULT '',
      car         text          NOT NULL DEFAULT '',
      bookings    integer       NOT NULL DEFAULT 0,
      total_value numeric(10,2) NOT NULL DEFAULT 0,
      first_seen  date,
      last_seen   date,
      updated_at  timestamptz   NOT NULL DEFAULT now()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS templates (
      id         serial       PRIMARY KEY,
      title      text         NOT NULL DEFAULT '',
      body       text         NOT NULL DEFAULT '',
      sort       integer      NOT NULL DEFAULT 0,
      updated_at timestamptz  NOT NULL DEFAULT now()
    );
  `;
  // Per-day job hours so a job spanning several days keeps each day's hours
  // and a running total; job_progress.finished lets an in-progress job carry
  // over to the next day's floor list until it's marked done.
  await sql`
    CREATE TABLE IF NOT EXISTS job_day_hours (
      uid        text          NOT NULL,
      work_date  date          NOT NULL,
      hours      numeric(6,2)  NOT NULL DEFAULT 0,
      PRIMARY KEY (uid, work_date)
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS job_progress (
      uid        text         PRIMARY KEY,
      finished   boolean      NOT NULL DEFAULT false,
      updated_at timestamptz  NOT NULL DEFAULT now()
    );
  `;
  // A running note per car (what still needs doing, rectify items) that travels
  // with the job across days.
  await sql`ALTER TABLE job_progress ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '';`;
  // Cancellation / no-show flag so we can track weekly/monthly drop-outs.
  await sql`ALTER TABLE job_progress ADD COLUMN IF NOT EXISTS cancelled boolean NOT NULL DEFAULT false;`;
  // Final quality-check sign-off: who signed the car off and when.
  await sql`ALTER TABLE job_progress ADD COLUMN IF NOT EXISTS signed_by text NOT NULL DEFAULT '';`;
  await sql`ALTER TABLE job_progress ADD COLUMN IF NOT EXISTS signed_at timestamptz;`;
  // Detailer time-clock: one row per detailer's start→stop on a car. Hours on a
  // car for a day = sum of these durations, rolled into job_day_hours.
  await sql`
    CREATE TABLE IF NOT EXISTS job_clock (
      id         serial       PRIMARY KEY,
      uid        text         NOT NULL,
      detailer   text         NOT NULL,
      work_date  date         NOT NULL,
      start_ts   timestamptz  NOT NULL DEFAULT now(),
      end_ts     timestamptz,
      updated_at timestamptz  NOT NULL DEFAULT now()
    );
  `;
  // One-time backfill: fold the old single-value job_hours into the per-day
  // table, stamped to each job's calendar date. Guarded so it runs only while
  // job_day_hours is still empty (i.e. this first migration pass).
  await sql`
    INSERT INTO job_day_hours (uid, work_date, hours)
    SELECT h.uid, b.booking_date, h.hours
    FROM job_hours h
    JOIN bookings b ON b.uid = h.uid
    WHERE h.hours > 0
      AND NOT EXISTS (SELECT 1 FROM job_day_hours)
    ON CONFLICT (uid, work_date) DO NOTHING;
  `;
  // Instant Quote leads — from the public homepage AI widget. Always a
  // "pending" request for Ashlee to confirm; never writes the calendar
  // directly, same human-in-the-loop model as every other booking.
  await sql`
    CREATE TABLE IF NOT EXISTS quote_leads (
      id             serial        PRIMARY KEY,
      created_at     timestamptz   NOT NULL DEFAULT now(),
      name           text          NOT NULL DEFAULT '',
      email          text          NOT NULL DEFAULT '',
      phone          text          NOT NULL DEFAULT '',
      vehicle_text   text          NOT NULL DEFAULT '',
      vehicle_size   text          NOT NULL DEFAULT '',
      priorities     jsonb         NOT NULL DEFAULT '[]'::jsonb,
      package_id     text          NOT NULL DEFAULT '',
      package_title  text          NOT NULL DEFAULT '',
      price          numeric(10,2) NOT NULL DEFAULT 0,
      requested_date date,
      requested_slot text          NOT NULL DEFAULT '',
      referral_code  text          NOT NULL DEFAULT '',
      status         text          NOT NULL DEFAULT 'pending'
    );
  `;
  // Smiths Garage "coming soon" waitlist — from the public /garage page. Anyone
  // who wants first dibs on the new services or the Maintenance Membership.
  // Lives in the same Supabase DB the ops manager reads, so a sign-up shows up
  // on the dashboard automatically. `interests` = which services they ticked;
  // `membership` = they specifically want the maintenance plan.
  await sql`
    CREATE TABLE IF NOT EXISTS waitlist (
      id          serial       PRIMARY KEY,
      created_at  timestamptz  NOT NULL DEFAULT now(),
      name        text         NOT NULL DEFAULT '',
      email       text         NOT NULL DEFAULT '',
      phone       text         NOT NULL DEFAULT '',
      vehicle     text         NOT NULL DEFAULT '',
      interests   jsonb        NOT NULL DEFAULT '[]'::jsonb,
      membership  boolean      NOT NULL DEFAULT false,
      message     text         NOT NULL DEFAULT '',
      source      text         NOT NULL DEFAULT 'garage-waitlist',
      status      text         NOT NULL DEFAULT 'pending'
    );
  `;
  // Smiths Garage service job card — one row per service, filled out on the
  // phone as the work is done. checklist = the JSONB service/inspection sheet
  // (per-item state, detail, photos). slug = the public /s/<slug> customer report.
  await sql`
    CREATE TABLE IF NOT EXISTS service_jobs (
      slug           text        PRIMARY KEY,
      created_at     timestamptz NOT NULL DEFAULT now(),
      updated_at     timestamptz NOT NULL DEFAULT now(),
      customer_name  text        NOT NULL DEFAULT '',
      customer_phone text        NOT NULL DEFAULT '',
      customer_email text        NOT NULL DEFAULT '',
      rego           text        NOT NULL DEFAULT '',
      vehicle        text        NOT NULL DEFAULT '',
      odometer       text        NOT NULL DEFAULT '',
      technician     text        NOT NULL DEFAULT '',
      checklist      jsonb       NOT NULL DEFAULT '[]'::jsonb,
      notes          text        NOT NULL DEFAULT '',
      next_service   text        NOT NULL DEFAULT '',
      status         text        NOT NULL DEFAULT 'in_progress'
    );
  `;

  // Indexes — keep queries fast as the tables grow. Wrapped so a failed
  // index can NEVER block a write (they're an optimisation, not required).
  try {
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_uid ON bookings(uid);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_booking_seen_first ON booking_seen(first_seen);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_followups_status ON job_followups(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customers_last ON customers(last_seen DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_job_day_hours_uid ON job_day_hours(uid);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_job_clock_open ON job_clock(detailer) WHERE end_ts IS NULL;`;
    await sql`CREATE INDEX IF NOT EXISTS idx_job_clock_uid ON job_clock(uid, work_date);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quote_leads_status ON quote_leads(status, created_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status, created_at DESC);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_service_jobs_created ON service_jobs(created_at DESC);`;
  } catch {
    /* indexes are an optimisation — never let them break a write */
  }
}

/** Time each dashboard read to find the slow/failing one. ?deep=dash */
export async function dashDiagnostics(): Promise<Record<string, string>> {
  const fmt = (ms: number) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane" }).format(new Date(ms));
  const today = fmt(Date.now());
  const from60 = fmt(Date.now() - 60 * 86400000);
  const checks: [string, () => Promise<unknown>][] = [
    ["getDailyLog", () => getDailyLog(today)],
    ["getRecentLogs", () => getRecentLogs(30)],
    ["getRecentBookings", () => getRecentBookings(from60)],
    ["getAds", () => getAds()],
    ["getJobsForDate", () => getJobsForDate(today)],
    ["getFollowups", () => getFollowups(from60, today)],
    ["getRectifyList", () => getRectifyList()],
    ["getSatisfaction", () => getSatisfaction(from60, today)],
    ["getReorderCount", () => getReorderCount()],
    ["getGrowthSeries", () => getGrowthSeries(from60, today)],
    ["getChecklist", () => getChecklist(today)],
  ];
  const out: Record<string, string> = {};
  for (const [name, fn] of checks) {
    const t0 = Date.now();
    try {
      await fn();
      out[name] = Date.now() - t0 + "ms";
    } catch (e) {
      out[name] = "ERR " + (Date.now() - t0) + "ms " + (e instanceof Error ? e.message : String(e)).slice(0, 90);
    }
  }
  return out;
}

/** Why is the team board empty? ?deep=team */
export async function teamDiagnostics(): Promise<Record<string, string>> {
  const fmt = (ms: number) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane" }).format(new Date(ms));
  const today = fmt(Date.now());
  const since = fmt(Date.now() - 13 * 86400000);
  const out: Record<string, string> = { today, since };
  try {
    const b = await sql`SELECT count(*)::int AS n FROM bookings WHERE booking_date = ${today};`;
    out.bookingsToday = String((b[0] as { n: number }).n);
    const all = await sql`
      SELECT count(*)::int AS n,
             to_char(min(booking_date), 'YYYY-MM-DD') AS mn,
             to_char(max(booking_date), 'YYYY-MM-DD') AS mx
      FROM bookings;`;
    const a = all[0] as { n: number; mn: string; mx: string };
    out.bookingsTotal = String(a.n);
    out.bookingRange = `${a.mn}..${a.mx}`;
    const t = await getTeamDay(today, since);
    out.teamJobs = String(t.length);
    out.sample = t.slice(0, 4).map((j) => j.summary).join(" | ").slice(0, 160);
  } catch (e) {
    out.error = (e instanceof Error ? e.message : String(e)).slice(0, 200);
  }
  return out;
}

/** Self-test the checklist read/write path — used by /api/health?deep=checklist. */
export async function checklistSelfTest(): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const D = "2000-01-02";
  try {
    await sql`DELETE FROM daily_log WHERE log_date = ${D};`;
    await setChecklist(D, ["_selftest"]);
    const rows = await sql`
      SELECT to_char(log_date, 'YYYY-MM-DD') AS d, checklist,
             pg_typeof(checklist)::text AS ty
      FROM daily_log WHERE log_date = ${D};
    `;
    out.rowsFound = String(rows.length);
    if (rows[0]) {
      const r = rows[0] as { checklist: unknown; ty: string };
      out.type = r.ty;
      out.rawIsArray = String(Array.isArray(r.checklist));
      out.raw = JSON.stringify(r.checklist).slice(0, 80);
    }
    out.getChecklist = JSON.stringify(await getChecklist(D)).slice(0, 80);
    await sql`DELETE FROM daily_log WHERE log_date = ${D};`;
  } catch (e) {
    out.error = (e instanceof Error ? e.message : String(e)).slice(0, 200);
  }
  return out;
}

/* ---- daily_log ------------------------------------------------------ */

export async function getDailyLog(date: string): Promise<DailyLog | null> {
  const rows = await sql<DailyLog[]>`
    SELECT to_char(log_date, 'YYYY-MM-DD')                       AS log_date,
           jobs_completed,
           revenue_collected::float8                             AS revenue_collected,
           completed_revenue::float8                             AS completed_revenue,
           ad_spend::float8                                      AS ad_spend,
           quotes, redos, messages,
           staff_hours, staff_shifts, staff_notes, notes_today,
           to_char(updated_at AT TIME ZONE 'Australia/Brisbane',
                   'YYYY-MM-DD"T"HH24:MI')                       AS updated_at
    FROM daily_log
    WHERE log_date = ${date};
  `;
  return rows[0] ?? null;
}

export async function getRecentLogs(limit = 30): Promise<DailyLog[]> {
  const rows = await sql<DailyLog[]>`
    SELECT to_char(log_date, 'YYYY-MM-DD')                       AS log_date,
           jobs_completed,
           revenue_collected::float8                             AS revenue_collected,
           completed_revenue::float8                             AS completed_revenue,
           ad_spend::float8                                      AS ad_spend,
           quotes, redos, messages,
           staff_hours, staff_shifts, staff_notes, notes_today,
           to_char(updated_at AT TIME ZONE 'Australia/Brisbane',
                   'YYYY-MM-DD"T"HH24:MI')                       AS updated_at
    FROM daily_log
    ORDER BY log_date DESC
    LIMIT ${limit};
  `;
  return rows as unknown as DailyLog[];
}

export async function upsertDailyLog(e: DailyLogInput): Promise<void> {
  await ensureTable();
  await sql`
    INSERT INTO daily_log
      (log_date, jobs_completed, revenue_collected, completed_revenue, ad_spend,
       quotes, redos, messages, staff_hours, staff_shifts,
       staff_notes, notes_today, updated_at)
    VALUES
      (${e.log_date}, ${e.jobs_completed}, ${e.revenue_collected}, ${e.completed_revenue}, ${e.ad_spend},
       ${e.quotes}, ${e.redos}, ${e.messages},
       ${sql.json(e.staff_hours)},
       ${sql.json(e.staff_shifts)},
       ${sql.json(e.staff_notes)},
       ${e.notes_today}, now())
    ON CONFLICT (log_date) DO UPDATE SET
       jobs_completed    = EXCLUDED.jobs_completed,
       revenue_collected = EXCLUDED.revenue_collected,
       completed_revenue = EXCLUDED.completed_revenue,
       ad_spend          = EXCLUDED.ad_spend,
       quotes            = EXCLUDED.quotes,
       redos             = EXCLUDED.redos,
       messages          = EXCLUDED.messages,
       staff_hours       = EXCLUDED.staff_hours,
       staff_shifts      = EXCLUDED.staff_shifts,
       staff_notes       = EXCLUDED.staff_notes,
       notes_today       = EXCLUDED.notes_today,
       updated_at        = now();
  `;
}

/* ---- bookings (from the uploaded calendar) -------------------------- */

/** Replace the whole bookings table with a fresh calendar snapshot. Atomic:
    the delete + insert run in one transaction so a mid-way timeout can never
    leave the table empty (it rolls back and the old snapshot survives). */
export async function replaceBookings(list: Booking[]): Promise<void> {
  await ensureTable();
  await sql.begin(async (tx) => {
    await tx`DELETE FROM bookings;`;
    if (list.length) {
      await tx`INSERT INTO bookings ${tx(
        list,
        "uid",
        "booking_date",
        "value",
        "is_correction",
        "summary",
        "extras",
        "car",
        "source"
      )}`;
    }
  });
}

/** Record the first day each booking (UID) appears — for new-bookings/day.
    ON CONFLICT DO NOTHING keeps the ORIGINAL first-seen date on re-uploads. */
export async function recordBookingsSeen(list: Booking[], today: string): Promise<void> {
  await ensureTable();
  const valid = list.filter((b) => b.uid);
  if (!valid.length) return;
  // First-ever upload = baseline: everything on the calendar already existed,
  // so stamp it far in the past ('2000-01-01') to keep it out of the "new per
  // day" counts. After that, genuinely new bookings get today's date.
  const cnt = await sql`SELECT count(*)::int AS n FROM booking_seen;`;
  const seen = ((cnt[0] as { n: number } | undefined)?.n ?? 0) === 0 ? "2000-01-01" : today;
  const rows = valid.map((b) => ({
    uid: b.uid,
    first_seen: seen,
    value: b.value,
    is_correction: b.is_correction,
    summary: b.summary,
  }));
  await sql`
    INSERT INTO booking_seen ${sql(rows, "uid", "first_seen", "value", "is_correction", "summary")}
    ON CONFLICT (uid) DO NOTHING
  `;
}

/** Record Meta ad messages for a specific day (from a single-day ads export). */
export async function setMetaMessages(date: string, count: number): Promise<void> {
  await ensureTable();
  await sql`
    INSERT INTO daily_log (log_date, messages_meta, updated_at)
    VALUES (${date}, ${count}, now())
    ON CONFLICT (log_date) DO UPDATE SET messages_meta = ${count}, updated_at = now();
  `;
}

/* ---- daily run sheet (Ashlee's checklist) -------------------------- */

/** Checked run-sheet item keys for a day. Crash-safe if the column doesn't
    exist yet (returns []), so it never breaks the dashboard pre-migration. */
export async function getChecklist(date: string): Promise<string[]> {
  try {
    const rows = await sql`SELECT checklist FROM daily_log WHERE log_date = ${date};`;
    const c = (rows[0] as { checklist?: unknown } | undefined)?.checklist;
    return Array.isArray(c) ? (c as string[]) : [];
  } catch {
    return [];
  }
}

export async function setChecklist(date: string, keys: string[]): Promise<void> {
  await ensureTable();
  await sql`
    INSERT INTO daily_log (log_date, checklist, updated_at)
    VALUES (${date}, ${sql.json(keys)}, now())
    ON CONFLICT (log_date) DO UPDATE SET checklist = ${sql.json(keys)}, updated_at = now();
  `;
}

export interface GrowthDay {
  date: string;
  messages: number; // manual "other" leads (SMS/web/phone)
  messages_meta: number; // auto from Meta ads upload
  new_bookings: number;
  new_corrections: number;
  new_value: number;
  ad_spend: number;
  revenue: number;
}

/** Per-day leads→bookings series: logged messages vs newly-appeared bookings. */
export async function getGrowthSeries(fromISO: string, toISO: string): Promise<GrowthDay[]> {
  const rows = await sql`
    WITH days AS (
      SELECT generate_series(${fromISO}::date, ${toISO}::date, interval '1 day')::date AS d
    ),
    nb AS (
      SELECT first_seen AS d,
             count(*)::int                                  AS new_bookings,
             count(*) FILTER (WHERE is_correction)::int     AS new_corrections,
             COALESCE(sum(value), 0)::float8                AS new_value
      FROM booking_seen
      GROUP BY first_seen
    )
    SELECT to_char(days.d, 'YYYY-MM-DD')          AS date,
           COALESCE(dl.messages, 0)::int          AS messages,
           COALESCE(dl.messages_meta, 0)::int     AS messages_meta,
           COALESCE(nb.new_bookings, 0)           AS new_bookings,
           COALESCE(nb.new_corrections, 0)        AS new_corrections,
           COALESCE(nb.new_value, 0)::float8      AS new_value,
           COALESCE(dl.ad_spend, 0)::float8       AS ad_spend,
           COALESCE(dl.revenue_collected, 0)::float8 AS revenue
    FROM days
    LEFT JOIN nb        ON nb.d = days.d
    LEFT JOIN daily_log dl ON dl.log_date = days.d
    ORDER BY days.d DESC;
  `;
  return rows as unknown as GrowthDay[];
}

export async function getRecentBookings(fromISO: string): Promise<Booking[]> {
  const rows = await sql<Booking[]>`
    SELECT uid, to_char(booking_date, 'YYYY-MM-DD') AS booking_date,
           value::float8                       AS value,
           is_correction, summary
    FROM bookings
    WHERE booking_date >= ${fromISO}
    ORDER BY booking_date;
  `;
  return rows as unknown as Booking[];
}

/** Today's jobs (from the calendar) with per-day + running-total hours. */
export interface JobWithHours extends Booking {
  hours: number; // running total across every day worked
  hours_today: number; // hours logged for the day being viewed
  finished: boolean; // marked done (so it stops carrying over)
  cancelled: boolean; // no-show / cancellation
  note: string; // running per-car note
}

const JOB_HOURS_SELECT = (date: string) => sql`
  SELECT b.uid, to_char(b.booking_date, 'YYYY-MM-DD') AS booking_date,
         b.value::float8 AS value, b.is_correction, b.summary,
         COALESCE((SELECT sum(hours) FROM job_day_hours d WHERE d.uid = b.uid), 0)::float8 AS hours,
         COALESCE((SELECT hours FROM job_day_hours d WHERE d.uid = b.uid AND d.work_date = ${date}), 0)::float8 AS hours_today,
         COALESCE(p.finished, false) AS finished,
         COALESCE(p.cancelled, false) AS cancelled,
         COALESCE(p.notes, '') AS note
`;

export async function getJobsForDate(date: string): Promise<JobWithHours[]> {
  await ensureTable(); // JOB_HOURS_SELECT reads p.cancelled — make sure it exists
  const rows = await sql`
    ${JOB_HOURS_SELECT(date)}
    FROM bookings b
    LEFT JOIN job_progress p ON p.uid = b.uid
    WHERE b.booking_date = ${date}
    ORDER BY b.value DESC;
  `;
  return rows as unknown as JobWithHours[];
}

/** Every job from an earlier day that hasn't been ticked done — so nothing
    leaves the floor on its own; only marking it done removes it. Bounded to a
    recent window so a forgotten job can't linger forever. */
export async function getCarryoverJobs(today: string, sinceISO: string): Promise<JobWithHours[]> {
  await ensureTable(); // JOB_HOURS_SELECT reads p.cancelled — make sure it exists
  const rows = await sql`
    ${JOB_HOURS_SELECT(today)}
    FROM bookings b
    LEFT JOIN job_progress p ON p.uid = b.uid
    WHERE b.booking_date < ${today}
      AND b.booking_date >= ${sinceISO}
      AND COALESCE(p.finished, false) = false
      AND COALESCE(p.cancelled, false) = false
    ORDER BY b.booking_date DESC;
  `;
  return rows as unknown as JobWithHours[];
}

/** Save the hours worked on a car for ONE day (keyed to calendar UID + date),
    so multi-day jobs accumulate a running total instead of overwriting. */
export async function setJobDayHours(
  entries: { uid: string; date: string; hours: number }[]
): Promise<void> {
  await ensureTable();
  for (const e of entries) {
    if (!e.uid || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) continue;
    await sql`
      INSERT INTO job_day_hours (uid, work_date, hours)
      VALUES (${e.uid}, ${e.date}, ${e.hours})
      ON CONFLICT (uid, work_date) DO UPDATE SET hours = EXCLUDED.hours;
    `;
  }
}

/** Cars that had hours logged on a specific day — for the day report. */
export async function getJobHoursForDate(
  date: string
): Promise<{ uid: string; summary: string; value: number; is_correction: boolean; hours: number }[]> {
  const rows = await sql`
    SELECT d.uid,
           COALESCE(b.summary, '')      AS summary,
           COALESCE(b.value, 0)::float8 AS value,
           COALESCE(b.is_correction, false) AS is_correction,
           d.hours::float8              AS hours
    FROM job_day_hours d
    LEFT JOIN bookings b ON b.uid = d.uid
    WHERE d.work_date = ${date} AND d.hours > 0
    ORDER BY d.hours DESC;
  `;
  return rows as unknown as {
    uid: string;
    summary: string;
    value: number;
    is_correction: boolean;
    hours: number;
  }[];
}

/** Mark a (multi-day) job done / not done so it stops carrying over. */
export async function setJobFinished(uid: string, finished: boolean): Promise<void> {
  await ensureTable();
  if (!uid) return;
  await sql`
    INSERT INTO job_progress (uid, finished, updated_at)
    VALUES (${uid}, ${finished}, now())
    ON CONFLICT (uid) DO UPDATE SET finished = EXCLUDED.finished, updated_at = now();
  `;
}

/** Final quality-check sign-off: records who signed the car off and marks it
    done. Any staff can do it — passing QC is what completes the car. */
export async function signOffJob(uid: string, name: string): Promise<void> {
  await ensureTable();
  if (!uid) return;
  await sql`
    INSERT INTO job_progress (uid, finished, signed_by, signed_at, updated_at)
    VALUES (${uid}, true, ${name}, now(), now())
    ON CONFLICT (uid) DO UPDATE
      SET finished = true, signed_by = EXCLUDED.signed_by, signed_at = now(), updated_at = now();
  `;
}

/** Mark a job as a no-show / cancellation (so it drops off the floor and is
    counted in the weekly/monthly cancellation tally). Toggleable to undo. */
export async function setJobCancelled(uid: string, cancelled: boolean): Promise<void> {
  await ensureTable();
  if (!uid) return;
  await sql`
    INSERT INTO job_progress (uid, cancelled, updated_at)
    VALUES (${uid}, ${cancelled}, now())
    ON CONFLICT (uid) DO UPDATE SET cancelled = EXCLUDED.cancelled, updated_at = now();
  `;
}

/** Per-day crew hours + shift start/finish times across a range. */
export async function getStaffHoursRange(
  fromISO: string,
  toISO: string
): Promise<
  {
    date: string;
    staff_hours: Record<string, number>;
    staff_shifts: Record<string, { start: string; end: string }>;
  }[]
> {
  try {
    const rows = await sql`
      SELECT to_char(log_date, 'YYYY-MM-DD') AS date, staff_hours, staff_shifts
      FROM daily_log
      WHERE log_date BETWEEN ${fromISO} AND ${toISO}
      ORDER BY log_date;`;
    return rows as unknown as {
      date: string;
      staff_hours: Record<string, number>;
      staff_shifts: Record<string, { start: string; end: string }>;
    }[];
  } catch {
    return [];
  }
}

/** Full booking rows (summary + extras + car) for offline analysis. */
export async function getBookingsDump(
  fromISO: string,
  toISO: string
): Promise<
  { date: string; value: number; is_correction: boolean; summary: string; extras: string; car: string }[]
> {
  try {
    const rows = await sql`
      SELECT to_char(booking_date, 'YYYY-MM-DD') AS date,
             value::float8 AS value, is_correction,
             COALESCE(summary, '') AS summary,
             COALESCE(extras, '')  AS extras,
             COALESCE(car, '')     AS car
      FROM bookings
      WHERE booking_date BETWEEN ${fromISO} AND ${toISO}
      ORDER BY booking_date;`;
    return rows as unknown as {
      date: string;
      value: number;
      is_correction: boolean;
      summary: string;
      extras: string;
      car: string;
    }[];
  } catch {
    return [];
  }
}

/** Jobs marked done since a date, with total hours + who worked them and for how
    long — the completed-jobs feed on the scoreboard (actual vs target). */
export interface CompletedJob {
  uid: string;
  summary: string;
  car: string;
  value: number;
  is_correction: boolean;
  extras: string;
  done_date: string;
  total_hours: number;
  signed_by: string;
  crew: { detailer: string; hours: number }[];
}

export async function getCompletedJobs(fromISO: string, limit = 40): Promise<CompletedJob[]> {
  try {
    const jobs = await sql`
      SELECT b.uid, COALESCE(b.summary, '') AS summary, COALESCE(b.car, '') AS car,
             b.value::float8 AS value, b.is_correction, COALESCE(b.extras, '') AS extras,
             to_char(p.updated_at AT TIME ZONE 'Australia/Brisbane', 'YYYY-MM-DD') AS done_date,
             COALESCE(p.signed_by, '') AS signed_by,
             COALESCE((SELECT sum(hours) FROM job_day_hours d WHERE d.uid = b.uid), 0)::float8 AS total_hours
      FROM job_progress p
      JOIN bookings b ON b.uid = p.uid
      WHERE p.finished = true
        AND COALESCE(p.cancelled, false) = false
        AND p.updated_at >= ${fromISO}
      ORDER BY p.updated_at DESC
      LIMIT ${limit};`;
    const list = jobs as unknown as CompletedJob[];
    if (!list.length) return [];
    const uids = list.map((j) => j.uid);
    const clocks = await sql`
      SELECT uid, detailer,
             sum(EXTRACT(EPOCH FROM (end_ts - start_ts)) / 3600.0)::float8 AS hours
      FROM job_clock
      WHERE uid IN ${sql(uids)} AND end_ts IS NOT NULL
      GROUP BY uid, detailer;`;
    const byUid: Record<string, { detailer: string; hours: number }[]> = {};
    for (const c of clocks as unknown as { uid: string; detailer: string; hours: number }[]) {
      (byUid[c.uid] ||= []).push({ detailer: c.detailer, hours: Number(c.hours) });
    }
    return list.map((j) => ({
      ...j,
      value: Number(j.value),
      total_hours: Number(j.total_hours),
      crew: (byUid[j.uid] || []).sort((a, b) => b.hours - a.hours),
    }));
  } catch {
    return [];
  }
}

/** No-show / cancellation counts by the job's booking date, for the ops tally. */
export async function getCancellationStats(
  weekFromISO: string,
  monthFromISO: string,
  toISO: string
): Promise<{ week: number; month: number }> {
  try {
    const rows = await sql`
      SELECT count(*) FILTER (WHERE b.booking_date >= ${weekFromISO})::int  AS week,
             count(*) FILTER (WHERE b.booking_date >= ${monthFromISO})::int AS month
      FROM job_progress p
      JOIN bookings b ON b.uid = p.uid
      WHERE p.cancelled = true AND b.booking_date <= ${toISO};`;
    const r = rows[0] as { week: number; month: number } | undefined;
    return r ?? { week: 0, month: 0 };
  } catch {
    return { week: 0, month: 0 };
  }
}

/** One row per day across a range, merging the daily log (earned/collected/ad
    spend/jobs/leads), bookings (count/corrections/booked value) and cancellations
    — the single source for the Analytics tab. */
export interface AnalyticsDay {
  date: string;
  earned: number; // completed_revenue — work done that day (the scoreboard number)
  collected: number; // cash actually taken
  ad_spend: number;
  jobs_completed: number;
  leads: number; // enquiries logged that day
  quotes: number;
  redos: number;
  booked: number; // $ value of bookings dated that day
  bookings: number; // count of bookings dated that day
  corrections: number; // of those bookings, how many corrections
  cancellations: number; // no-shows dated that day
}

export async function getAnalytics(fromISO: string, toISO: string): Promise<AnalyticsDay[]> {
  try {
    const rows = await sql`
      WITH days AS (
        SELECT generate_series(${fromISO}::date, ${toISO}::date, interval '1 day')::date AS d
      ),
      bk AS (
        SELECT booking_date AS d,
               count(*)::int                              AS bookings,
               count(*) FILTER (WHERE is_correction)::int AS corrections,
               COALESCE(sum(value), 0)::float8            AS booked
        FROM bookings
        WHERE booking_date BETWEEN ${fromISO} AND ${toISO}
        GROUP BY booking_date
      ),
      cx AS (
        SELECT b.booking_date AS d, count(*)::int AS cancellations
        FROM job_progress p JOIN bookings b ON b.uid = p.uid
        WHERE p.cancelled = true AND b.booking_date BETWEEN ${fromISO} AND ${toISO}
        GROUP BY b.booking_date
      )
      SELECT to_char(days.d, 'YYYY-MM-DD')                  AS date,
             COALESCE(dl.completed_revenue, 0)::float8      AS earned,
             COALESCE(dl.revenue_collected, 0)::float8      AS collected,
             COALESCE(dl.ad_spend, 0)::float8              AS ad_spend,
             COALESCE(dl.jobs_completed, 0)::int           AS jobs_completed,
             COALESCE(dl.messages, 0)::int                 AS leads,
             COALESCE(dl.quotes, 0)::int                   AS quotes,
             COALESCE(dl.redos, 0)::int                    AS redos,
             COALESCE(bk.booked, 0)::float8               AS booked,
             COALESCE(bk.bookings, 0)::int                AS bookings,
             COALESCE(bk.corrections, 0)::int             AS corrections,
             COALESCE(cx.cancellations, 0)::int           AS cancellations
      FROM days
      LEFT JOIN daily_log dl ON dl.log_date = days.d
      LEFT JOIN bk ON bk.d = days.d
      LEFT JOIN cx ON cx.d = days.d
      ORDER BY days.d;`;
    return rows as unknown as AnalyticsDay[];
  } catch {
    return [];
  }
}

/** Set the running per-car note (what still needs doing / rectify items). */
export async function setJobNote(uid: string, note: string): Promise<void> {
  await ensureTable();
  if (!uid) return;
  await sql`
    INSERT INTO job_progress (uid, notes, updated_at)
    VALUES (${uid}, ${note}, now())
    ON CONFLICT (uid) DO UPDATE SET notes = EXCLUDED.notes, updated_at = now();
  `;
}

/* ---- detailer time-clock (the team board) ------------------------- */

/** Recompute a car's hours for a day = sum of every finished clock that day. */
async function recomputeJobDayHours(uid: string, date: string): Promise<void> {
  await sql`
    INSERT INTO job_day_hours (uid, work_date, hours)
    VALUES (${uid}, ${date}, COALESCE((
      SELECT sum(EXTRACT(EPOCH FROM (end_ts - start_ts)) / 3600.0)
      FROM job_clock
      WHERE uid = ${uid} AND work_date = ${date} AND end_ts IS NOT NULL
    ), 0))
    ON CONFLICT (uid, work_date) DO UPDATE SET hours = EXCLUDED.hours;
  `;
}

/** A detailer starts on a car. Closes any car they were already on (one car at
    a time), then opens a fresh clock. Recomputes any car that got closed. */
export async function clockStart(
  uid: string,
  detailer: string,
  date: string,
  startedMinsAgo = 0
): Promise<void> {
  await ensureTable();
  if (!uid || !detailer || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  // Ashlee can backdate a forgotten start (capped at 12h so a typo can't wreck it).
  const mins = Number.isFinite(startedMinsAgo) && startedMinsAgo > 0 ? Math.min(startedMinsAgo, 720) : 0;
  const closed = await sql`
    UPDATE job_clock SET end_ts = now(), updated_at = now()
    WHERE detailer = ${detailer} AND end_ts IS NULL
    RETURNING uid, to_char(work_date, 'YYYY-MM-DD') AS d;
  `;
  await sql`
    INSERT INTO job_clock (uid, detailer, work_date, start_ts)
    VALUES (${uid}, ${detailer}, ${date}, now() - make_interval(mins => ${mins}));
  `;
  for (const r of closed as unknown as { uid: string; d: string }[]) {
    await recomputeJobDayHours(r.uid, r.d);
  }
}

/** A detailer stops on a car. Closes their open clock for it and recomputes. */
export async function clockStop(uid: string, detailer: string, date: string): Promise<void> {
  await ensureTable();
  if (!uid || !detailer) return;
  await sql`
    UPDATE job_clock SET end_ts = now(), updated_at = now()
    WHERE detailer = ${detailer} AND uid = ${uid} AND end_ts IS NULL;
  `;
  await recomputeJobDayHours(uid, date);
}

export interface TeamActive {
  detailer: string;
  start_ms: number;
}
export interface TeamJob {
  uid: string;
  summary: string;
  value: number;
  is_correction: boolean;
  extras: string;
  car: string; // vehicle make/model
  carried: boolean;
  hours_today: number; // completed clock hours today
  hours_total: number; // running total across every day worked
  note: string; // running per-car note (what still needs doing)
  active: TeamActive[];
}

/** Today's floor for the detailers: today's cars + any car still open from an
    earlier day, EXCLUDING anything Ashlee has marked done. A car stays here —
    and keeps accumulating time — until it's finished. */
export async function getTeamDay(date: string, sinceISO: string): Promise<TeamJob[]> {
  const jobs = await sql`
    SELECT b.uid, b.summary, b.value::float8 AS value, b.is_correction,
           COALESCE(b.extras, '') AS extras,
           COALESCE(b.car, '') AS car,
           (b.booking_date < ${date}) AS carried,
           COALESCE((
             SELECT sum(EXTRACT(EPOCH FROM (end_ts - start_ts)) / 3600.0)
             FROM job_clock c WHERE c.uid = b.uid AND c.work_date = ${date} AND c.end_ts IS NOT NULL
           ), 0)::float8 AS hours_today,
           COALESCE((
             SELECT sum(hours) FROM job_day_hours d WHERE d.uid = b.uid
           ), 0)::float8 AS hours_total,
           COALESCE(p.notes, '') AS note
    FROM bookings b
    LEFT JOIN job_progress p ON p.uid = b.uid
    WHERE COALESCE(p.finished, false) = false
      AND (b.booking_date = ${date}
           OR (b.booking_date < ${date} AND b.booking_date >= ${sinceISO}))
    ORDER BY b.booking_date DESC, b.value DESC;
  `;
  const open = await sql`
    SELECT uid, detailer, (EXTRACT(EPOCH FROM start_ts) * 1000)::float8 AS start_ms
    FROM job_clock WHERE work_date = ${date} AND end_ts IS NULL;
  `;
  const byUid: Record<string, TeamActive[]> = {};
  for (const o of open as unknown as { uid: string; detailer: string; start_ms: number }[]) {
    (byUid[o.uid] ||= []).push({ detailer: o.detailer, start_ms: Number(o.start_ms) });
  }
  return (jobs as unknown as TeamJob[]).map((j) => ({
    ...j,
    value: Number(j.value),
    hours_today: Number(j.hours_today),
    hours_total: Number(j.hours_total),
    active: byUid[j.uid] || [],
  }));
}

/* ---- customer check-ins (day-after follow-up) --------------------- */

export interface JobFollowup extends Booking {
  status: string; // pending | happy | unhappy | rectified
}

/** Recent jobs with their check-in status (for the "who still needs a check-in" list). */
export async function getFollowups(fromISO: string, toISO: string): Promise<JobFollowup[]> {
  const rows = await sql`
    SELECT b.uid, to_char(b.booking_date, 'YYYY-MM-DD') AS booking_date,
           b.value::float8 AS value, b.is_correction, b.summary,
           COALESCE(f.status, 'pending') AS status
    FROM bookings b
    LEFT JOIN job_followups f ON f.uid = b.uid
    LEFT JOIN job_progress p ON p.uid = b.uid
    WHERE b.booking_date >= ${fromISO} AND b.booking_date <= ${toISO}
      AND COALESCE(p.cancelled, false) = false
    ORDER BY b.booking_date DESC;
  `;
  return rows as unknown as JobFollowup[];
}

/** Set a customer's check-in outcome, keyed to the calendar UID. */
export async function setFollowupStatus(uid: string, status: string): Promise<void> {
  await ensureTable();
  await sql`
    INSERT INTO job_followups (uid, status, done, updated_at)
    VALUES (${uid}, ${status}, ${status === "happy"}, now())
    ON CONFLICT (uid) DO UPDATE SET status = EXCLUDED.status, done = EXCLUDED.done, updated_at = now();
  `;
}

/** Unhappy customers still awaiting a rectify job (any date, until sorted). */
export async function getRectifyList(): Promise<JobFollowup[]> {
  const rows = await sql`
    SELECT b.uid, to_char(b.booking_date, 'YYYY-MM-DD') AS booking_date,
           b.value::float8 AS value, b.is_correction, b.summary, f.status AS status
    FROM job_followups f
    JOIN bookings b ON b.uid = f.uid
    WHERE f.status = 'unhappy'
    ORDER BY b.booking_date DESC;
  `;
  return rows as unknown as JobFollowup[];
}

/** Happy vs unhappy tally over a period (jobs booked in that window). */
export async function getSatisfaction(
  fromISO: string,
  toISO: string
): Promise<{ happy: number; unhappy: number }> {
  const rows = await sql`
    SELECT
      count(*) FILTER (WHERE f.status = 'happy')::int                     AS happy,
      count(*) FILTER (WHERE f.status IN ('unhappy','rectified'))::int    AS unhappy
    FROM job_followups f
    JOIN bookings b ON b.uid = f.uid
    WHERE b.booking_date >= ${fromISO} AND b.booking_date <= ${toISO};
  `;
  const r = rows[0] as { happy: number; unhappy: number } | undefined;
  return { happy: r?.happy ?? 0, unhappy: r?.unhappy ?? 0 };
}

/* ---- stocktake ----------------------------------------------------- */

export interface StockItem {
  id: number;
  category: string;
  item: string;
  brand: string;
  website: string;
  unit: string;
  min_qty: number;
  current_qty: number;
  notes: string;
  ordered: boolean;
  updated_at: string; // "DD/MM/YY" Cairns
}

export async function getStock(): Promise<StockItem[]> {
  const rows = await sql`
    SELECT id, category, item, brand, website, unit,
           min_qty::float8 AS min_qty, current_qty::float8 AS current_qty, notes, ordered,
           to_char(updated_at AT TIME ZONE 'Australia/Brisbane', 'DD/MM/YY') AS updated_at
    FROM stock_items
    ORDER BY category, brand, item;
  `;
  return rows as unknown as StockItem[];
}

export async function addStockItem(i: Omit<StockItem, "id" | "updated_at" | "ordered">): Promise<void> {
  await ensureTable();
  await sql`
    INSERT INTO stock_items (category, item, brand, website, unit, min_qty, current_qty, notes)
    VALUES (${i.category}, ${i.item}, ${i.brand}, ${i.website}, ${i.unit},
            ${i.min_qty}, ${i.current_qty}, ${i.notes});
  `;
}

export async function updateStock(
  entries: { id: number; current_qty: number; min_qty: number; website: string; notes: string }[]
): Promise<void> {
  await ensureTable();
  for (const e of entries) {
    if (!e.id) continue;
    await sql`
      UPDATE stock_items
      SET current_qty = ${e.current_qty}, min_qty = ${e.min_qty},
          website = ${e.website}, notes = ${e.notes},
          ordered = CASE WHEN ${e.current_qty} >= ${e.min_qty} THEN false ELSE ordered END,
          updated_at = now()
      WHERE id = ${e.id};
    `;
  }
}

/** Tick a low item as ordered (or un-tick it). */
export async function setOrdered(id: number, ordered: boolean): Promise<void> {
  await ensureTable();
  await sql`UPDATE stock_items SET ordered = ${ordered} WHERE id = ${id};`;
}

export async function deleteStockItem(id: number): Promise<void> {
  await ensureTable();
  await sql`DELETE FROM stock_items WHERE id = ${id};`;
}

export async function clearStock(): Promise<void> {
  await ensureTable();
  await sql`DELETE FROM stock_items;`;
}

export async function getReorderCount(): Promise<number> {
  const rows = await sql`
    SELECT count(*)::int AS n FROM stock_items WHERE current_qty < min_qty AND ordered = false;
  `;
  return (rows[0] as { n: number } | undefined)?.n ?? 0;
}

/** Trivial DB touch — used by /api/health to keep the connection + the
    Supabase project awake so it never pauses on idle. 6s cap so it returns
    fast (503) instead of hanging when the DB is unreachable. */
export async function pingDb(): Promise<boolean> {
  try {
    await Promise.race([
      sql`SELECT 1 AS ok`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("ping-timeout")), 6000)),
    ]);
    return true;
  } catch {
    return false;
  }
}

/* ---- ad_stats (from the uploaded Meta ads CSV) --------------------- */

export async function replaceAds(list: AdRow[]): Promise<void> {
  await ensureTable();
  await sql`DELETE FROM ad_stats;`;
  if (list.length) {
    await sql`INSERT INTO ad_stats ${sql(
      list,
      "name",
      "spend",
      "messages",
      "new_contacts",
      "purchases",
      "impressions",
      "reach"
    )}`;
  }
}

export async function getAds(): Promise<AdRow[]> {
  const rows = await sql<AdRow[]>`
    SELECT name, spend::float8 AS spend, messages, new_contacts, purchases,
           impressions, reach,
           CASE WHEN messages > 0 THEN spend::float8 / messages ELSE 0 END AS cost_per_message
    FROM ad_stats
    ORDER BY spend DESC;
  `;
  return rows as unknown as AdRow[];
}

/* ---- customers (CRM, auto-built from the calendar) ----------------- */

/** Where bookings (conversions) come from — grouped by the normalised source,
    with count, corrections, and revenue. The heart of ad/channel attribution. */
export interface SourceRow {
  source: string;
  bookings: number;
  corrections: number;
  revenue: number;
}
export async function getSourceBreakdown(
  fromISO = "2000-01-01",
  toISO = "2999-01-01"
): Promise<SourceRow[]> {
  try {
    const rows = await sql`
      SELECT COALESCE(NULLIF(trim(source), ''), 'Not recorded') AS source,
             count(*)::int                              AS bookings,
             count(*) FILTER (WHERE is_correction)::int AS corrections,
             COALESCE(sum(value), 0)::float8            AS revenue
      FROM bookings
      WHERE booking_date BETWEEN ${fromISO} AND ${toISO}
      GROUP BY 1
      ORDER BY revenue DESC;`;
    return rows as unknown as SourceRow[];
  } catch {
    return [];
  }
}

/* ---- Meta Leads Centre snapshot ------------------------------------- */

export interface LeadStats {
  total: number;
  newThisWeek: number;
  backlog: number; // warm, not yet converted, not junk — the "work these" pile
  convertedThisWeek: number;
  loadedAt: string | null;
}

export async function replaceLeads(
  list: {
    name: string; email: string; phone: string; source: string;
    channel: string; stage: string; ad_id: string; created_date: string;
  }[]
): Promise<void> {
  await ensureTable();
  await sql.begin(async (tx) => {
    await tx`DELETE FROM meta_leads;`;
    const CHUNK = 500;
    for (let i = 0; i < list.length; i += CHUNK) {
      const slice = list.slice(i, i + CHUNK).map((l) => ({
        name: l.name, email: l.email, phone: l.phone, source: l.source,
        channel: l.channel, stage: l.stage, ad_id: l.ad_id,
        created_date: /^\d{4}-\d{2}-\d{2}$/.test(l.created_date) ? l.created_date : null,
      }));
      if (slice.length)
        await tx`INSERT INTO meta_leads ${tx(slice, "name", "email", "phone", "source", "channel", "stage", "ad_id", "created_date")}`;
    }
  });
}

export async function getLeadStats(weekStartISO: string): Promise<LeadStats> {
  try {
    const rows = await sql`
      SELECT count(*)::int AS total,
             count(*) FILTER (WHERE created_date >= ${weekStartISO})::int AS new_week,
             count(*) FILTER (WHERE stage ILIKE '%follow up%' OR stage ILIKE 'intake' OR stage ILIKE 'qualified')::int AS backlog,
             count(*) FILTER (WHERE stage ILIKE 'converted' AND created_date >= ${weekStartISO})::int AS conv_week,
             to_char(max(loaded_at) AT TIME ZONE 'Australia/Brisbane', 'YYYY-MM-DD HH24:MI') AS loaded
      FROM meta_leads;`;
    const r = (rows[0] as { total: number; new_week: number; backlog: number; conv_week: number; loaded: string | null }) || {};
    return {
      total: r.total || 0, newThisWeek: r.new_week || 0, backlog: r.backlog || 0,
      convertedThisWeek: r.conv_week || 0, loadedAt: r.loaded || null,
    };
  } catch {
    return { total: 0, newThisWeek: 0, backlog: 0, convertedThisWeek: 0, loadedAt: null };
  }
}

/* ---- Upsell inspection portal --------------------------------------- */

export interface InspectionItem {
  id: string;
  title: string;
  description: string;
  price: number;
  photos: string[];
  selected?: boolean;
}
export interface Inspection {
  slug: string;
  booking_uid: string;
  customer_name: string;
  vehicle: string;
  items: InspectionItem[];
  status: "draft" | "sent" | "responded";
  customer_note: string;
  member: boolean; // member → 10% off every upsell on the customer view
  created_at: string;
  responded_at: string | null;
}

function newSlug(): string {
  // short, URL-safe, hard to guess enough for an unlisted link
  return (
    Math.abs(Date.now() % 1e6).toString(36) +
    globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 8)
  );
}

/** Create a blank inspection for a car and return its public slug. */
export async function createInspection(input: {
  bookingUid: string;
  customerName: string;
  vehicle: string;
  member?: boolean;
}): Promise<string> {
  await ensureTable();
  const slug = newSlug();
  await sql`
    INSERT INTO inspections (slug, booking_uid, customer_name, vehicle, member)
    VALUES (${slug}, ${input.bookingUid || ""}, ${input.customerName || ""}, ${input.vehicle || ""}, ${!!input.member});`;
  return slug;
}

export async function setInspectionMember(slug: string, member: boolean): Promise<void> {
  await ensureTable();
  await sql`UPDATE inspections SET member = ${!!member} WHERE slug = ${slug};`;
}

function mapInspection(r: Record<string, unknown>): Inspection {
  const items = Array.isArray(r.items) ? (r.items as InspectionItem[]) : [];
  return {
    slug: String(r.slug),
    booking_uid: String(r.booking_uid || ""),
    customer_name: String(r.customer_name || ""),
    vehicle: String(r.vehicle || ""),
    items: items.map((it) => ({
      id: String(it.id),
      title: String(it.title || ""),
      description: String(it.description || ""),
      price: Number(it.price) || 0,
      photos: Array.isArray(it.photos) ? it.photos.map(String) : [],
      selected: !!it.selected,
    })),
    status: (r.status as Inspection["status"]) || "draft",
    customer_note: String(r.customer_note || ""),
    member: !!r.member,
    created_at: String(r.created_at || ""),
    responded_at: r.responded_at ? String(r.responded_at) : null,
  };
}

export async function getInspection(slug: string): Promise<Inspection | null> {
  await ensureTable();
  const rows = await sql`SELECT * FROM inspections WHERE slug = ${slug} LIMIT 1;`;
  return rows[0] ? mapInspection(rows[0] as Record<string, unknown>) : null;
}

export async function getInspectionByBooking(uid: string): Promise<Inspection | null> {
  await ensureTable();
  const rows = await sql`SELECT * FROM inspections WHERE booking_uid = ${uid} ORDER BY created_at DESC LIMIT 1;`;
  return rows[0] ? mapInspection(rows[0] as Record<string, unknown>) : null;
}

/** Save the builder's item list. Marks the inspection "sent" once it has items. */
export async function saveInspectionItems(slug: string, items: InspectionItem[]): Promise<void> {
  await ensureTable();
  const list = items || [];
  await sql`
    UPDATE inspections
    SET items = ${sql.json(list as unknown as Parameters<typeof sql.json>[0])},
        status = CASE WHEN status = 'responded' THEN 'responded'
                      WHEN ${list.length} > 0 THEN 'sent' ELSE 'draft' END
    WHERE slug = ${slug};`;
}

/** Customer ticks the extras they want and sends it back. */
export async function recordInspectionResponse(
  slug: string,
  selectedIds: string[],
  note: string
): Promise<void> {
  await ensureTable();
  const insp = await getInspection(slug);
  if (!insp) return;
  const items = insp.items.map((it) => ({ ...it, selected: selectedIds.includes(it.id) }));
  await sql`
    UPDATE inspections
    SET items = ${sql.json(items as unknown as Parameters<typeof sql.json>[0])},
        status = 'responded',
        customer_note = ${note || ""},
        responded_at = now()
    WHERE slug = ${slug};`;
}

export async function listRecentInspections(limit = 40): Promise<Inspection[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM inspections ORDER BY created_at DESC LIMIT ${limit};`;
  return (rows as Record<string, unknown>[]).map(mapInspection);
}

/** Diagnostic: does the save round-trip work, and what's actually stored? */
export async function inspectDiagnostics(): Promise<unknown> {
  const out: Record<string, unknown> = {};
  try {
    await ensureTable();
    const slug = "selftest-" + Date.now().toString(36);
    await sql`INSERT INTO inspections (slug, customer_name, vehicle) VALUES (${slug}, 'SelfTest', 'Test');`;
    await saveInspectionItems(slug, [
      { id: "a1", title: "Test extra", description: "d", price: 10, photos: [], selected: false },
    ]);
    const back = await getInspection(slug);
    await sql`DELETE FROM inspections WHERE slug = ${slug};`;
    out.selfTest = { ok: true, savedItems: back?.items.length ?? -1, status: back?.status };
  } catch (e) {
    out.selfTest = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
  try {
    // Repair any rows saved before the sql.json() fix (items is a scalar, not
    // an array) so they read cleanly instead of showing empty forever.
    const fixed = await sql`
      UPDATE inspections SET items = '[]'::jsonb
      WHERE jsonb_typeof(items) <> 'array' RETURNING slug;`;
    out.repaired = (fixed as unknown[]).length;
  } catch (e) {
    out.repaired = e instanceof Error ? e.message : String(e);
  }
  try {
    const recent = await sql`
      SELECT slug, customer_name, status,
             jsonb_array_length(items) AS item_count,
             to_char(created_at AT TIME ZONE 'Australia/Brisbane', 'YYYY-MM-DD HH24:MI') AS created
      FROM inspections ORDER BY created_at DESC LIMIT 10;`;
    out.recent = recent;
  } catch (e) {
    out.recent = { error: e instanceof Error ? e.message : String(e) };
  }
  return out;
}

/* ---- Real sales (Xero SalesInvoices) -------------------------------- */

export interface SalesStats {
  loadedAt: string | null;
  revenue: number;
  invoices: number;
  avg: number;
  allTimeRevenue: number;
  allTimeInvoices: number;
  monthly: { month: string; revenue: number; invoices: number }[];
  byService: { service: string; revenue: number; count: number }[];
}

/** Merge Xero invoices in by invoice number — so multiple exports (the 500-row
    cap forces splitting) accumulate, and re-uploading updates existing rows. */
export async function upsertSales(
  list: {
    invoice_number: string; contact_name: string; email: string;
    invoice_date: string; total: number; status: string; description: string;
  }[]
): Promise<void> {
  await ensureTable();
  await sql.begin(async (tx) => {
    const CHUNK = 500;
    for (let i = 0; i < list.length; i += CHUNK) {
      const slice = list.slice(i, i + CHUNK).map((s) => ({
        invoice_number: s.invoice_number,
        contact_name: s.contact_name,
        contact_norm: normName(s.contact_name),
        email: s.email,
        invoice_date: /^\d{4}-\d{2}-\d{2}$/.test(s.invoice_date) ? s.invoice_date : null,
        total: s.total,
        status: s.status,
        description: String(s.description || "").slice(0, 500),
      }));
      if (slice.length)
        await tx`INSERT INTO sales ${tx(slice, "invoice_number", "contact_name", "contact_norm", "email", "invoice_date", "total", "status", "description")}
          ON CONFLICT (invoice_number) DO UPDATE SET
            contact_name = EXCLUDED.contact_name,
            contact_norm = EXCLUDED.contact_norm,
            email = EXCLUDED.email,
            invoice_date = EXCLUDED.invoice_date,
            total = EXCLUDED.total,
            status = EXCLUDED.status,
            description = EXCLUDED.description,
            loaded_at = now()`;
    }
  });
}

export async function getSalesStats(fromISO: string, toISO: string): Promise<SalesStats> {
  const empty: SalesStats = {
    loadedAt: null, revenue: 0, invoices: 0, avg: 0,
    allTimeRevenue: 0, allTimeInvoices: 0, monthly: [], byService: [],
  };
  try {
    await ensureTable();
    const p = (await sql`
      SELECT count(*)::int AS invoices, coalesce(sum(total),0)::float AS revenue,
             to_char(max(loaded_at) AT TIME ZONE 'Australia/Brisbane', 'YYYY-MM-DD HH24:MI') AS loaded
      FROM sales WHERE invoice_date >= ${fromISO} AND invoice_date <= ${toISO};`) as unknown as {
      invoices: number; revenue: number; loaded: string | null;
    }[];
    const a = (await sql`SELECT count(*)::int AS invoices, coalesce(sum(total),0)::float AS revenue FROM sales;`) as unknown as {
      invoices: number; revenue: number;
    }[];
    const monthly = (await sql`
      SELECT to_char(invoice_date, 'YYYY-MM') AS month, coalesce(sum(total),0)::float AS revenue, count(*)::int AS invoices
      FROM sales WHERE invoice_date >= ${fromISO} AND invoice_date <= ${toISO}
      GROUP BY 1 ORDER BY 1;`) as unknown as { month: string; revenue: number; invoices: number }[];
    const byService = (await sql`
      SELECT CASE
        WHEN description ILIKE '%correction%' OR description ILIKE '%coating%' OR description ILIKE '%ceramic%' THEN 'Correction / Coating'
        WHEN description ILIKE '%cut%polish%' THEN 'Cut & Polish'
        WHEN description ILIKE '%headlight%' THEN 'Headlight'
        WHEN description ILIKE '%polish%' THEN 'Polish'
        WHEN description ILIKE '%interior%' AND description ILIKE '%exterior%' THEN 'Full Detail'
        WHEN description ILIKE '%full detail%' THEN 'Full Detail'
        WHEN description ILIKE '%interior%' THEN 'Interior'
        ELSE 'Other' END AS service,
        coalesce(sum(total),0)::float AS revenue, count(*)::int AS count
      FROM sales WHERE invoice_date >= ${fromISO} AND invoice_date <= ${toISO}
      GROUP BY 1 ORDER BY revenue DESC;`) as unknown as { service: string; revenue: number; count: number }[];
    const pr = p[0] || { invoices: 0, revenue: 0, loaded: null };
    const ar = a[0] || { invoices: 0, revenue: 0 };
    return {
      loadedAt: pr.loaded || null,
      revenue: pr.revenue || 0,
      invoices: pr.invoices || 0,
      avg: pr.invoices ? pr.revenue / pr.invoices : 0,
      allTimeRevenue: ar.revenue || 0,
      allTimeInvoices: ar.invoices || 0,
      monthly: monthly.map((m) => ({ month: m.month, revenue: Number(m.revenue) || 0, invoices: Number(m.invoices) || 0 })),
      byService: byService.map((s) => ({ service: s.service, revenue: Number(s.revenue) || 0, count: Number(s.count) || 0 })),
    };
  } catch {
    return empty;
  }
}

/** Lean dashboard headline numbers — real revenue (Xero) + leads (Meta) for
    this week and month, in two queries. Auto-tracked from the uploads so the
    day never needs manual logging. */
export interface DashSummary {
  weekRev: number;
  weekInv: number;
  monthRev: number;
  monthInv: number;
  weekLeads: number;
  monthLeads: number;
  salesLoaded: string | null;
  leadsLoaded: string | null;
}
export async function getDashSummary(
  weekStart: string,
  monthStart: string,
  todayISO: string
): Promise<DashSummary> {
  const empty: DashSummary = {
    weekRev: 0, weekInv: 0, monthRev: 0, monthInv: 0,
    weekLeads: 0, monthLeads: 0, salesLoaded: null, leadsLoaded: null,
  };
  try {
    await ensureTable();
    const s = (await sql`
      SELECT
        coalesce(sum(total) FILTER (WHERE invoice_date >= ${weekStart}), 0)::float AS week_rev,
        count(*) FILTER (WHERE invoice_date >= ${weekStart})::int AS week_inv,
        coalesce(sum(total) FILTER (WHERE invoice_date >= ${monthStart}), 0)::float AS month_rev,
        count(*) FILTER (WHERE invoice_date >= ${monthStart})::int AS month_inv,
        to_char(max(loaded_at) AT TIME ZONE 'Australia/Brisbane', 'YYYY-MM-DD HH24:MI') AS loaded
      FROM sales WHERE invoice_date <= ${todayISO};`) as unknown as {
      week_rev: number; week_inv: number; month_rev: number; month_inv: number; loaded: string | null;
    }[];
    const l = (await sql`
      SELECT
        count(*) FILTER (WHERE created_date >= ${weekStart})::int AS week_leads,
        count(*) FILTER (WHERE created_date >= ${monthStart})::int AS month_leads,
        to_char(max(loaded_at) AT TIME ZONE 'Australia/Brisbane', 'YYYY-MM-DD HH24:MI') AS loaded
      FROM meta_leads;`) as unknown as {
      week_leads: number; month_leads: number; loaded: string | null;
    }[];
    const sr = s[0] || ({} as (typeof s)[0]);
    const lr = l[0] || ({} as (typeof l)[0]);
    return {
      weekRev: Number(sr.week_rev) || 0,
      weekInv: Number(sr.week_inv) || 0,
      monthRev: Number(sr.month_rev) || 0,
      monthInv: Number(sr.month_inv) || 0,
      weekLeads: Number(lr.week_leads) || 0,
      monthLeads: Number(lr.month_leads) || 0,
      salesLoaded: sr.loaded || null,
      leadsLoaded: lr.loaded || null,
    };
  } catch {
    return empty;
  }
}

export interface LeadSaleMatch {
  realLeads: number;
  matchedLeads: number;
  matchedRevenue: number;
  matchRate: number;
  byAd: { ad_id: string; leads: number; matched: number; revenue: number }[];
}

/** Cross-match Meta leads to real Xero invoices by normalised customer name —
    a "confirmed paid" floor on conversion (Messenger leads have no email, and
    names differ, so this UNDER-counts). */
export async function getLeadSaleMatch(): Promise<LeadSaleMatch> {
  const empty: LeadSaleMatch = { realLeads: 0, matchedLeads: 0, matchedRevenue: 0, matchRate: 0, byAd: [] };
  try {
    await ensureTable();
    const sales = (await sql`
      SELECT contact_norm, coalesce(sum(total),0)::float AS revenue
      FROM sales WHERE contact_norm <> '' GROUP BY contact_norm;`) as unknown as {
      contact_norm: string; revenue: number;
    }[];
    const saleRev = new Map<string, number>();
    for (const s of sales) saleRev.set(s.contact_norm, Number(s.revenue) || 0);

    const leads = (await sql`SELECT name, ad_id FROM meta_leads WHERE stage NOT ILIKE 'abused';`) as unknown as {
      name: string; ad_id: string;
    }[];

    let realLeads = 0;
    let matchedLeads = 0;
    const matchedNames = new Set<string>();
    const adMap = new Map<string, { leads: number; matched: number; names: Set<string> }>();
    for (const l of leads) {
      realLeads++;
      const n = normName(l.name);
      const hit = !!n && saleRev.has(n);
      if (hit) {
        matchedLeads++;
        matchedNames.add(n);
      }
      const ad = l.ad_id || "";
      if (ad) {
        const e = adMap.get(ad) || { leads: 0, matched: 0, names: new Set<string>() };
        e.leads++;
        if (hit) {
          e.matched++;
          e.names.add(n);
        }
        adMap.set(ad, e);
      }
    }
    let matchedRevenue = 0;
    matchedNames.forEach((n) => (matchedRevenue += saleRev.get(n) || 0));
    const byAd = [...adMap.entries()]
      .map(([ad_id, v]) => ({
        ad_id,
        leads: v.leads,
        matched: v.matched,
        revenue: [...v.names].reduce((a, n) => a + (saleRev.get(n) || 0), 0),
      }))
      .filter((a) => a.matched > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
    return {
      realLeads,
      matchedLeads,
      matchedRevenue,
      matchRate: realLeads ? Math.round((100 * matchedLeads) / realLeads) : 0,
      byAd,
    };
  } catch {
    return empty;
  }
}

/* ---- Lead Centre analytics (funnel · follow-up aging · conversion) --- */

export interface LeadAnalytics {
  loadedAt: string | null;
  total: number;
  real: number; // genuine enquiries = total minus junk (Abused)
  abused: number;
  // current funnel snapshot
  intake: number;
  qualified: number;
  followUp: number;
  fu1: number;
  fu2: number;
  fu3: number;
  converted: number;
  working: number; // still in play (intake + qualified + follow-ups)
  conversionRate: number; // converted ÷ real, 0-100
  // follow-up backlog aged by how long since the lead came in
  fuFresh: number; // ≤ 7 days — chase now
  fuWarm: number; // 8-21 days
  fuStale: number; // 22-60 days
  fuCold: number; // 60+ days — likely dead
  // selected period (by lead created_date)
  newInPeriod: number;
  convertedInPeriod: number;
  // trends & attribution
  weekly: { week: string; leads: number; converted: number }[];
  byAd: { ad_id: string; leads: number; converted: number; rate: number }[];
  bySource: { source: string; leads: number; converted: number }[];
}

const EMPTY_LEAD_ANALYTICS: LeadAnalytics = {
  loadedAt: null, total: 0, real: 0, abused: 0, intake: 0, qualified: 0,
  followUp: 0, fu1: 0, fu2: 0, fu3: 0, converted: 0, working: 0, conversionRate: 0,
  fuFresh: 0, fuWarm: 0, fuStale: 0, fuCold: 0, newInPeriod: 0, convertedInPeriod: 0,
  weekly: [], byAd: [], bySource: [],
};

/** Everything the Leads section (Analytics + Uploads) needs, from the current
    Lead Centre snapshot. Aging is measured from each lead's created_date; the
    funnel is a live snapshot (a replaced upload overwrites it). */
export async function getLeadAnalytics(
  fromISO: string,
  toISO: string,
  todayISO: string
): Promise<LeadAnalytics> {
  const shift = (iso: string, n: number): string => {
    const d = new Date(iso + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };
  const d7 = shift(todayISO, -7);
  const d21 = shift(todayISO, -21);
  const d60 = shift(todayISO, -60);
  try {
    const rows = await sql`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE stage ILIKE 'abused')::int AS abused,
        count(*) FILTER (WHERE stage ILIKE 'intake')::int AS intake,
        count(*) FILTER (WHERE stage ILIKE 'qualified')::int AS qualified,
        count(*) FILTER (WHERE stage ILIKE '%1st follow%')::int AS fu1,
        count(*) FILTER (WHERE stage ILIKE '%2nd follow%')::int AS fu2,
        count(*) FILTER (WHERE stage ILIKE '%3rd follow%')::int AS fu3,
        count(*) FILTER (WHERE stage ILIKE '%follow up%')::int AS followup,
        count(*) FILTER (WHERE stage ILIKE 'converted')::int AS converted,
        count(*) FILTER (WHERE created_date >= ${fromISO} AND created_date <= ${toISO})::int AS new_period,
        count(*) FILTER (WHERE stage ILIKE 'converted' AND created_date >= ${fromISO} AND created_date <= ${toISO})::int AS conv_period,
        count(*) FILTER (WHERE stage ILIKE '%follow up%' AND created_date >= ${d7})::int AS fu_fresh,
        count(*) FILTER (WHERE stage ILIKE '%follow up%' AND created_date < ${d7} AND created_date >= ${d21})::int AS fu_warm,
        count(*) FILTER (WHERE stage ILIKE '%follow up%' AND created_date < ${d21} AND created_date >= ${d60})::int AS fu_stale,
        count(*) FILTER (WHERE stage ILIKE '%follow up%' AND (created_date < ${d60} OR created_date IS NULL))::int AS fu_cold,
        to_char(max(loaded_at) AT TIME ZONE 'Australia/Brisbane', 'YYYY-MM-DD HH24:MI') AS loaded
      FROM meta_leads;`;
    const r = rows[0] as Record<string, number | string | null>;
    const num = (v: number | string | null | undefined) => Number(v) || 0;

    const weekly = (await sql`
      SELECT to_char(date_trunc('week', created_date), 'YYYY-MM-DD') AS week,
             count(*)::int AS leads,
             count(*) FILTER (WHERE stage ILIKE 'converted')::int AS converted
      FROM meta_leads
      WHERE created_date >= ${fromISO} AND created_date <= ${toISO}
      GROUP BY 1 ORDER BY 1;`) as unknown as { week: string; leads: number; converted: number }[];

    const byAd = (await sql`
      SELECT ad_id,
             count(*)::int AS leads,
             count(*) FILTER (WHERE stage ILIKE 'converted')::int AS converted
      FROM meta_leads
      WHERE ad_id <> '' AND stage NOT ILIKE 'abused'
      GROUP BY ad_id ORDER BY converted DESC, leads DESC LIMIT 8;`) as unknown as {
      ad_id: string; leads: number; converted: number;
    }[];

    const bySource = (await sql`
      SELECT COALESCE(NULLIF(source, ''), 'Unknown') AS source,
             count(*)::int AS leads,
             count(*) FILTER (WHERE stage ILIKE 'converted')::int AS converted
      FROM meta_leads
      WHERE stage NOT ILIKE 'abused'
      GROUP BY 1 ORDER BY leads DESC LIMIT 6;`) as unknown as {
      source: string; leads: number; converted: number;
    }[];

    const total = num(r.total);
    const abused = num(r.abused);
    const converted = num(r.converted);
    const followUp = num(r.followup);
    const intake = num(r.intake);
    const qualified = num(r.qualified);
    const real = Math.max(0, total - abused);
    const working = intake + qualified + followUp;

    return {
      loadedAt: (r.loaded as string) || null,
      total, real, abused, intake, qualified, followUp,
      fu1: num(r.fu1), fu2: num(r.fu2), fu3: num(r.fu3),
      converted, working,
      conversionRate: real > 0 ? Math.round((converted / real) * 100) : 0,
      fuFresh: num(r.fu_fresh), fuWarm: num(r.fu_warm),
      fuStale: num(r.fu_stale), fuCold: num(r.fu_cold),
      newInPeriod: num(r.new_period), convertedInPeriod: num(r.conv_period),
      weekly: weekly.map((w) => ({ week: w.week, leads: Number(w.leads) || 0, converted: Number(w.converted) || 0 })),
      byAd: byAd.map((a) => ({
        ad_id: a.ad_id,
        leads: Number(a.leads) || 0,
        converted: Number(a.converted) || 0,
        rate: Number(a.leads) > 0 ? Math.round((Number(a.converted) / Number(a.leads)) * 100) : 0,
      })),
      bySource: bySource.map((s) => ({ source: s.source, leads: Number(s.leads) || 0, converted: Number(s.converted) || 0 })),
    };
  } catch {
    return { ...EMPTY_LEAD_ANALYTICS };
  }
}

/** Diagnostic snapshot of the meta_leads table — to confirm an upload landed. */
export async function leadDiagnostics(): Promise<unknown> {
  try {
    const c = await sql`
      SELECT count(*)::int AS total,
             count(*) FILTER (WHERE ad_id <> '')::int AS with_ad,
             count(*) FILTER (WHERE created_date IS NOT NULL)::int AS with_date,
             to_char(max(loaded_at) AT TIME ZONE 'Australia/Brisbane', 'YYYY-MM-DD HH24:MI') AS loaded
      FROM meta_leads;`;
    const stages = await sql`SELECT stage, count(*)::int AS n FROM meta_leads GROUP BY stage ORDER BY n DESC LIMIT 12;`;
    const recent = await sql`
      SELECT name, stage, ad_id, to_char(created_date, 'YYYY-MM-DD') AS created
      FROM meta_leads WHERE created_date IS NOT NULL ORDER BY created_date DESC LIMIT 6;`;
    return { ...(c[0] as object), stages, recent };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "err" };
  }
}

export interface Customer {
  dedupe_key: string;
  name: string;
  phone: string;
  email: string;
  car: string;
  bookings: number;
  total_value: number;
  last_seen: string | null;
}

export async function upsertCustomers(
  list: {
    key: string;
    name: string;
    phone: string;
    email: string;
    car: string;
    bookings: number;
    total_value: number;
    first_seen: string;
    last_seen: string;
  }[]
): Promise<void> {
  await ensureTable();
  if (!list.length) return;
  const rows = list.map((c) => ({
    dedupe_key: c.key,
    name: c.name,
    phone: c.phone,
    email: c.email,
    car: c.car,
    bookings: c.bookings,
    total_value: c.total_value,
    first_seen: c.first_seen,
    last_seen: c.last_seen,
  }));
  await sql`
    INSERT INTO customers ${sql(
      rows,
      "dedupe_key",
      "name",
      "phone",
      "email",
      "car",
      "bookings",
      "total_value",
      "first_seen",
      "last_seen"
    )}
    ON CONFLICT (dedupe_key) DO UPDATE SET
      name        = CASE WHEN EXCLUDED.name  <> '' THEN EXCLUDED.name  ELSE customers.name  END,
      phone       = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE customers.phone END,
      email       = CASE WHEN EXCLUDED.email <> '' THEN EXCLUDED.email ELSE customers.email END,
      car         = CASE WHEN EXCLUDED.car   <> '' THEN EXCLUDED.car   ELSE customers.car   END,
      bookings    = EXCLUDED.bookings,
      total_value = EXCLUDED.total_value,
      first_seen  = LEAST(customers.first_seen, EXCLUDED.first_seen),
      last_seen   = GREATEST(customers.last_seen, EXCLUDED.last_seen),
      updated_at  = now();
  `;
}

export async function getCustomers(search = "", limit = 300): Promise<Customer[]> {
  try {
    const s = search.trim();
    const q = `%${s}%`;
    const rows = s
      ? await sql`
          SELECT dedupe_key, name, phone, email, car, bookings,
                 total_value::float8 AS total_value,
                 to_char(last_seen, 'YYYY-MM-DD') AS last_seen
          FROM customers
          WHERE name ILIKE ${q} OR phone ILIKE ${q} OR email ILIKE ${q} OR car ILIKE ${q}
          ORDER BY last_seen DESC NULLS LAST
          LIMIT ${limit};
        `
      : await sql`
          SELECT dedupe_key, name, phone, email, car, bookings,
                 total_value::float8 AS total_value,
                 to_char(last_seen, 'YYYY-MM-DD') AS last_seen
          FROM customers
          ORDER BY last_seen DESC NULLS LAST
          LIMIT ${limit};
        `;
    return rows as unknown as Customer[];
  } catch {
    return [];
  }
}

export async function clearCustomers(): Promise<void> {
  await ensureTable();
  await sql`DELETE FROM customers;`;
}

/* ---- templates (quote/package library) ----------------------------- */

export interface Template {
  id: number;
  title: string;
  body: string;
  sort: number;
}

export async function getTemplates(): Promise<Template[]> {
  try {
    const rows = await sql`SELECT id, title, body, sort FROM templates ORDER BY sort, id;`;
    return rows as unknown as Template[];
  } catch {
    return [];
  }
}

export async function upsertTemplate(id: number | null, title: string, body: string): Promise<void> {
  await ensureTable();
  if (id && id > 0) {
    await sql`UPDATE templates SET title = ${title}, body = ${body}, updated_at = now() WHERE id = ${id};`;
  } else {
    await sql`INSERT INTO templates (title, body) VALUES (${title}, ${body});`;
  }
}

export async function deleteTemplate(id: number): Promise<void> {
  await ensureTable();
  await sql`DELETE FROM templates WHERE id = ${id};`;
}

/** Replace the whole template library (used by the standard-set loader). */
export async function replaceTemplates(
  list: { title: string; body: string; sort: number }[]
): Promise<void> {
  await ensureTable();
  await sql`DELETE FROM templates;`;
  if (list.length) {
    await sql`INSERT INTO templates ${sql(list, "title", "body", "sort")}`;
  }
}

/* ---- quote_leads (public Instant Quote widget) ---------------------- */

export interface QuoteLeadInput {
  name: string;
  email: string;
  phone: string;
  vehicle_text: string;
  vehicle_size: string;
  priorities: string[];
  package_id: string;
  package_title: string;
  price: number;
  requested_date: string; // YYYY-MM-DD
  requested_slot: string;
  referral_code: string;
}

export interface QuoteLead extends QuoteLeadInput {
  id: number;
  created_at: string; // Cairns-local "YYYY-MM-DDTHH:MM"
  status: string; // pending | actioned
}

export async function insertQuoteLead(l: QuoteLeadInput): Promise<void> {
  await ensureTable();
  await sql`
    INSERT INTO quote_leads
      (name, email, phone, vehicle_text, vehicle_size, priorities,
       package_id, package_title, price, requested_date, requested_slot, referral_code)
    VALUES
      (${l.name}, ${l.email}, ${l.phone}, ${l.vehicle_text}, ${l.vehicle_size},
       ${sql.json(l.priorities)}, ${l.package_id}, ${l.package_title}, ${l.price},
       ${l.requested_date}, ${l.requested_slot}, ${l.referral_code});
  `;
}

/** Pending leads for the /ops dashboard card, newest first. */
export async function getQuoteLeads(status = "pending"): Promise<QuoteLead[]> {
  try {
    const rows = await sql`
      SELECT id, name, email, phone, vehicle_text, vehicle_size, priorities,
             package_id, package_title, price::float8 AS price,
             to_char(requested_date, 'YYYY-MM-DD') AS requested_date,
             requested_slot, referral_code, status,
             to_char(created_at AT TIME ZONE 'Australia/Brisbane',
                     'YYYY-MM-DD"T"HH24:MI')      AS created_at
      FROM quote_leads
      WHERE status = ${status}
      ORDER BY created_at DESC
      LIMIT 100;
    `;
    return rows as unknown as QuoteLead[];
  } catch {
    return [];
  }
}

export async function setQuoteLeadStatus(id: number, status: string): Promise<void> {
  await ensureTable();
  await sql`UPDATE quote_leads SET status = ${status} WHERE id = ${id};`;
}

/** All-time instant-quote funnel: everyone who got a quote through the homepage
    widget. `total` = every lead ever, `pending` = not yet actioned by the team.
    None book through the widget (booking is manual), so total = quoted-not-booked. */
export async function getQuoteLeadStats(): Promise<{ total: number; pending: number; actioned: number }> {
  try {
    const rows = await sql`
      SELECT count(*)::int                                       AS total,
             count(*) FILTER (WHERE status = 'pending')::int     AS pending,
             count(*) FILTER (WHERE status = 'actioned')::int    AS actioned
      FROM quote_leads;`;
    const r = rows[0] as { total: number; pending: number; actioned: number } | undefined;
    return r ?? { total: 0, pending: 0, actioned: 0 };
  } catch {
    return { total: 0, pending: 0, actioned: 0 };
  }
}

/* ---- waitlist (public Smiths Garage coming-soon page) --------------- */

export interface WaitlistInput {
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  interests: string[];
  membership: boolean;
  message: string;
  source: string; // "garage-waitlist" | "membership-page"
}

export interface WaitlistEntry extends WaitlistInput {
  id: number;
  created_at: string; // Cairns-local "YYYY-MM-DDTHH:MM"
  status: string; // pending | actioned
}

export async function insertWaitlist(w: WaitlistInput): Promise<void> {
  await ensureTable();
  await sql`
    INSERT INTO waitlist (name, email, phone, vehicle, interests, membership, message, source)
    VALUES (${w.name}, ${w.email}, ${w.phone}, ${w.vehicle},
            ${sql.json(w.interests)}, ${w.membership}, ${w.message},
            ${w.source || "garage-waitlist"});
  `;
}

/** Waitlist sign-ups for the /ops dashboard, newest first. */
export async function getWaitlist(status = "pending"): Promise<WaitlistEntry[]> {
  try {
    const rows = await sql`
      SELECT id, name, email, phone, vehicle, interests, membership, message, status,
             coalesce(source, 'garage-waitlist') AS source,
             to_char(created_at AT TIME ZONE 'Australia/Brisbane',
                     'YYYY-MM-DD"T"HH24:MI') AS created_at
      FROM waitlist
      WHERE status = ${status}
      ORDER BY created_at DESC
      LIMIT 200;
    `;
    return rows as unknown as WaitlistEntry[];
  } catch {
    return [];
  }
}

export async function setWaitlistStatus(id: number, status: string): Promise<void> {
  await ensureTable();
  await sql`UPDATE waitlist SET status = ${status} WHERE id = ${id};`;
}

export async function deleteWaitlist(id: number): Promise<void> {
  await ensureTable();
  await sql`DELETE FROM waitlist WHERE id = ${id};`;
}

/** Every waitlist entry (any status) for the /ops/waitlist tab, newest first. */
export async function getAllWaitlist(): Promise<WaitlistEntry[]> {
  try {
    const rows = await sql`
      SELECT id, name, email, phone, vehicle, interests, membership, message, status,
             coalesce(source, 'garage-waitlist') AS source,
             to_char(created_at AT TIME ZONE 'Australia/Brisbane',
                     'YYYY-MM-DD"T"HH24:MI') AS created_at
      FROM waitlist
      ORDER BY created_at DESC
      LIMIT 500;
    `;
    return rows as unknown as WaitlistEntry[];
  } catch {
    return [];
  }
}

/** Waitlist funnel counts for the dashboard card. `members` = how many of the
    pending sign-ups specifically want the Maintenance Membership. */
export async function getWaitlistStats(): Promise<{
  total: number; pending: number; actioned: number; members: number;
}> {
  try {
    const rows = await sql`
      SELECT count(*)::int                                                  AS total,
             count(*) FILTER (WHERE status = 'pending')::int                AS pending,
             count(*) FILTER (WHERE status = 'actioned')::int               AS actioned,
             count(*) FILTER (WHERE membership AND status = 'pending')::int AS members
      FROM waitlist;`;
    const r = rows[0] as { total: number; pending: number; actioned: number; members: number } | undefined;
    return r ?? { total: 0, pending: 0, actioned: 0, members: 0 };
  } catch {
    return { total: 0, pending: 0, actioned: 0, members: 0 };
  }
}

/* ---- service_jobs (Smiths Garage service card) --------------------- */

export interface ServiceJob {
  slug: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  rego: string;
  vehicle: string;
  odometer: string;
  technician: string;
  checklist: ServiceChecklistItem[];
  notes: string;
  next_service: string;
  status: string; // in_progress | completed
}

export async function createServiceJob(input: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  rego: string;
  vehicle: string;
  odometer: string;
  technician: string;
}): Promise<string> {
  await ensureTable();
  const slug = newSlug();
  const checklist = freshChecklist();
  await sql`
    INSERT INTO service_jobs
      (slug, customer_name, customer_phone, customer_email, rego, vehicle, odometer, technician, checklist)
    VALUES
      (${slug}, ${input.customerName || ""}, ${input.customerPhone || ""}, ${input.customerEmail || ""},
       ${input.rego || ""}, ${input.vehicle || ""}, ${input.odometer || ""}, ${input.technician || ""},
       ${sql.json(checklist as unknown as Parameters<typeof sql.json>[0])});`;
  return slug;
}

function mapServiceJob(r: Record<string, unknown>): ServiceJob {
  const raw = Array.isArray(r.checklist) ? (r.checklist as ServiceChecklistItem[]) : [];
  return {
    slug: String(r.slug),
    created_at: String(r.created_at || ""),
    customer_name: String(r.customer_name || ""),
    customer_phone: String(r.customer_phone || ""),
    customer_email: String(r.customer_email || ""),
    rego: String(r.rego || ""),
    vehicle: String(r.vehicle || ""),
    odometer: String(r.odometer || ""),
    technician: String(r.technician || ""),
    checklist: raw.map((it) => ({
      key: String(it.key || ""),
      label: String(it.label || ""),
      hint: String(it.hint || ""),
      state: (["pending", "ok", "attention", "urgent", "na"].includes(String(it.state))
        ? it.state
        : "pending") as ServiceChecklistItem["state"],
      detail: String(it.detail || ""),
      photos: Array.isArray(it.photos) ? it.photos.map(String) : [],
    })),
    notes: String(r.notes || ""),
    next_service: String(r.next_service || ""),
    status: String(r.status || "in_progress"),
  };
}

export async function getServiceJob(slug: string): Promise<ServiceJob | null> {
  await ensureTable();
  const rows = await sql`SELECT * FROM service_jobs WHERE slug = ${slug} LIMIT 1;`;
  return rows[0] ? mapServiceJob(rows[0] as Record<string, unknown>) : null;
}

/** Save the whole card (the client sends its full state). */
export async function saveServiceJob(
  slug: string,
  j: Omit<ServiceJob, "slug" | "created_at">,
): Promise<void> {
  await ensureTable();
  await sql`
    UPDATE service_jobs SET
      customer_name  = ${j.customer_name},
      customer_phone = ${j.customer_phone},
      customer_email = ${j.customer_email},
      rego           = ${j.rego},
      vehicle        = ${j.vehicle},
      odometer       = ${j.odometer},
      technician     = ${j.technician},
      checklist      = ${sql.json(j.checklist as unknown as Parameters<typeof sql.json>[0])},
      notes          = ${j.notes},
      next_service   = ${j.next_service},
      status         = ${j.status},
      updated_at     = now()
    WHERE slug = ${slug};`;
}

export async function listServiceJobs(limit = 80): Promise<ServiceJob[]> {
  try {
    await ensureTable();
    const rows = await sql`SELECT * FROM service_jobs ORDER BY created_at DESC LIMIT ${limit};`;
    return (rows as Record<string, unknown>[]).map(mapServiceJob);
  } catch {
    return [];
  }
}

/* ---- export --------------------------------------------------------- */

export async function getAllLogs(): Promise<Record<string, unknown>[]> {
  const rows = await sql`
    SELECT to_char(log_date, 'YYYY-MM-DD') AS log_date,
           jobs_completed, revenue_collected::float8 AS revenue_collected,
           completed_revenue::float8 AS completed_revenue, ad_spend::float8 AS ad_spend,
           quotes, redos, messages, happy_customers, unhappy_customers,
           staff_hours, staff_notes, notes_today,
           to_char(updated_at AT TIME ZONE 'Australia/Brisbane', 'YYYY-MM-DD HH24:MI') AS updated_at
    FROM daily_log
    ORDER BY log_date DESC;
  `;
  return rows as unknown as Record<string, unknown>[];
}
