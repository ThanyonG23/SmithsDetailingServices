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

const sql = postgres(connectionString, { ssl: "require", prepare: false, max: 1 });

let ensured = false;
async function ensureTable(): Promise<void> {
  if (ensured) return;
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
  ensured = true;
}

/* ---- daily_log ------------------------------------------------------ */

export async function getDailyLog(date: string): Promise<DailyLog | null> {
  await ensureTable();
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
  await ensureTable();
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
  await ensureTable();
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
  await ensureTable();
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
  await ensureTable();
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
  await ensureTable();
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
