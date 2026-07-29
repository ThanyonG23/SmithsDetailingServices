import postgres from "postgres";

/* =====================================================================
   DAILY OPS — data layer (Supabase / any Postgres)
   ---------------------------------------------------------------------
   Uses the `postgres` client so it works with the Supabase connection
   already wired into Vercel (POSTGRES_URL etc.). One row per day
   (log_date is the primary key); per-staff data is JSON keyed by name:
     staff_shifts = { "Ashlee": { start, end }, ... }
     staff_hours  = { "Ashlee": 9.75, ... }   (computed on save)
     staff_notes  = { "Ashlee": "…", ... }
   The table + newer columns are created lazily on first use.
   ===================================================================== */

export interface DailyLogInput {
  log_date: string; // YYYY-MM-DD
  bookings: number;
  jobs_completed: number;
  revenue_collected: number;
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

/* Connection string from the Supabase integration on Vercel. Prefer the
   pooled URL for serverless; fall back to the others. */
const connectionString =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  "";

/* `prepare: false` keeps us compatible with Supabase's transaction pooler
   (pgbouncer); `ssl: require` because Supabase requires TLS; `max: 1`
   keeps the pool tiny for serverless. */
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
  ensured = true;
}

export async function getDailyLog(date: string): Promise<DailyLog | null> {
  await ensureTable();
  const rows = await sql<DailyLog[]>`
    SELECT to_char(log_date, 'YYYY-MM-DD')                       AS log_date,
           bookings, jobs_completed,
           revenue_collected::float8                             AS revenue_collected,
           happy_customers, unhappy_customers,
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
           bookings, jobs_completed,
           revenue_collected::float8                             AS revenue_collected,
           happy_customers, unhappy_customers,
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
      (log_date, bookings, jobs_completed, revenue_collected,
       happy_customers, unhappy_customers, staff_hours, staff_shifts,
       staff_notes, notes_today, updated_at)
    VALUES
      (${e.log_date}, ${e.bookings}, ${e.jobs_completed}, ${e.revenue_collected},
       ${e.happy_customers}, ${e.unhappy_customers},
       ${JSON.stringify(e.staff_hours)}::jsonb,
       ${JSON.stringify(e.staff_shifts)}::jsonb,
       ${JSON.stringify(e.staff_notes)}::jsonb,
       ${e.notes_today}, now())
    ON CONFLICT (log_date) DO UPDATE SET
       bookings          = EXCLUDED.bookings,
       jobs_completed    = EXCLUDED.jobs_completed,
       revenue_collected = EXCLUDED.revenue_collected,
       happy_customers   = EXCLUDED.happy_customers,
       unhappy_customers = EXCLUDED.unhappy_customers,
       staff_hours       = EXCLUDED.staff_hours,
       staff_shifts      = EXCLUDED.staff_shifts,
       staff_notes       = EXCLUDED.staff_notes,
       notes_today       = EXCLUDED.notes_today,
       updated_at        = now();
  `;
}
