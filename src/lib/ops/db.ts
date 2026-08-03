import postgres from "postgres";
import type { Booking } from "./calendar";
import type { AdRow } from "./ads";

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
  happy_customers: number;
  unhappy_customers: number;
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
  max: 1,
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
    const rows = await sql`
      SELECT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_date'
      ) AS ready;
    `;
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
  // Indexes — keep queries fast as the tables grow. Wrapped so a failed
  // index can NEVER block a write (they're an optimisation, not required).
  try {
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_uid ON bookings(uid);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_booking_seen_first ON booking_seen(first_seen);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_followups_status ON job_followups(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customers_last ON customers(last_seen DESC);`;
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
           quotes, redos, messages, happy_customers, unhappy_customers,
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
           quotes, redos, messages, happy_customers, unhappy_customers,
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
       quotes, redos, messages, happy_customers, unhappy_customers, staff_hours, staff_shifts,
       staff_notes, notes_today, updated_at)
    VALUES
      (${e.log_date}, ${e.jobs_completed}, ${e.revenue_collected}, ${e.completed_revenue}, ${e.ad_spend},
       ${e.quotes}, ${e.redos}, ${e.messages}, ${e.happy_customers}, ${e.unhappy_customers},
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
       happy_customers   = EXCLUDED.happy_customers,
       unhappy_customers = EXCLUDED.unhappy_customers,
       staff_hours       = EXCLUDED.staff_hours,
       staff_shifts      = EXCLUDED.staff_shifts,
       staff_notes       = EXCLUDED.staff_notes,
       notes_today       = EXCLUDED.notes_today,
       updated_at        = now();
  `;
}

/* ---- bookings (from the uploaded calendar) -------------------------- */

/** Replace the whole bookings table with a fresh calendar snapshot. */
export async function replaceBookings(list: Booking[]): Promise<void> {
  await ensureTable();
  await sql`DELETE FROM bookings;`;
  if (list.length) {
    await sql`INSERT INTO bookings ${sql(
      list,
      "uid",
      "booking_date",
      "value",
      "is_correction",
      "summary"
    )}`;
  }
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

/** Today's jobs (from the calendar) with any logged hours joined in. */
export interface JobWithHours extends Booking {
  hours: number;
}
export async function getJobsForDate(date: string): Promise<JobWithHours[]> {
  const rows = await sql`
    SELECT b.uid, to_char(b.booking_date, 'YYYY-MM-DD') AS booking_date,
           b.value::float8 AS value, b.is_correction, b.summary,
           COALESCE(h.hours, 0)::float8 AS hours
    FROM bookings b
    LEFT JOIN job_hours h ON h.uid = b.uid
    WHERE b.booking_date = ${date}
    ORDER BY b.value DESC;
  `;
  return rows as unknown as JobWithHours[];
}

/** Save hours-per-car, keyed to the calendar UID so it survives re-uploads. */
export async function saveJobHours(entries: { uid: string; hours: number }[]): Promise<void> {
  await ensureTable();
  for (const e of entries) {
    if (!e.uid) continue;
    await sql`
      INSERT INTO job_hours (uid, hours, updated_at)
      VALUES (${e.uid}, ${e.hours}, now())
      ON CONFLICT (uid) DO UPDATE SET hours = EXCLUDED.hours, updated_at = now();
    `;
  }
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
    WHERE b.booking_date >= ${fromISO} AND b.booking_date <= ${toISO}
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
