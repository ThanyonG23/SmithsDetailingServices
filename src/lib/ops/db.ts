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
  connect_timeout: 15, // fail fast instead of hanging on a bad connection
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
}

/* ---- daily_log ------------------------------------------------------ */

export async function getDailyLog(date: string): Promise<DailyLog | null> {
  const rows = await sql<DailyLog[]>`
    SELECT to_char(log_date, 'YYYY-MM-DD')                       AS log_date,
           jobs_completed,
           revenue_collected::float8                             AS revenue_collected,
           completed_revenue::float8                             AS completed_revenue,
           ad_spend::float8                                      AS ad_spend,
           quotes, redos, happy_customers, unhappy_customers,
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
           quotes, redos, happy_customers, unhappy_customers,
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
       quotes, redos, happy_customers, unhappy_customers, staff_hours, staff_shifts,
       staff_notes, notes_today, updated_at)
    VALUES
      (${e.log_date}, ${e.jobs_completed}, ${e.revenue_collected}, ${e.completed_revenue}, ${e.ad_spend},
       ${e.quotes}, ${e.redos}, ${e.happy_customers}, ${e.unhappy_customers},
       ${JSON.stringify(e.staff_hours)}::jsonb,
       ${JSON.stringify(e.staff_shifts)}::jsonb,
       ${JSON.stringify(e.staff_notes)}::jsonb,
       ${e.notes_today}, now())
    ON CONFLICT (log_date) DO UPDATE SET
       jobs_completed    = EXCLUDED.jobs_completed,
       revenue_collected = EXCLUDED.revenue_collected,
       completed_revenue = EXCLUDED.completed_revenue,
       ad_spend          = EXCLUDED.ad_spend,
       quotes            = EXCLUDED.quotes,
       redos             = EXCLUDED.redos,
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

/* ---- export --------------------------------------------------------- */

export async function getAllLogs(): Promise<Record<string, unknown>[]> {
  const rows = await sql`
    SELECT to_char(log_date, 'YYYY-MM-DD') AS log_date,
           jobs_completed, revenue_collected::float8 AS revenue_collected,
           completed_revenue::float8 AS completed_revenue, ad_spend::float8 AS ad_spend,
           quotes, redos, happy_customers, unhappy_customers,
           staff_hours, staff_notes, notes_today,
           to_char(updated_at AT TIME ZONE 'Australia/Brisbane', 'YYYY-MM-DD HH24:MI') AS updated_at
    FROM daily_log
    ORDER BY log_date DESC;
  `;
  return rows as unknown as Record<string, unknown>[];
}
