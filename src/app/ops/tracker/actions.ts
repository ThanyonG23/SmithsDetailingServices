"use server";

import { requireOwner } from "@/lib/ops/auth";
import { sql } from "@/lib/ops/db";

/* Daily Grind tracker: a scoreboard (emails / doors / follow-ups / posts) with
   targets, and a lead follow-up log. Two lazily-created tables. Dates are stored
   as YYYY-MM-DD text (the client passes its local Cairns date) to avoid any
   timezone drift. Reads run sequentially in one action (the pooler deadlocks on
   parallel reads). */

const FIELDS = ["emails", "doors", "followups", "posts"] as const;
export type Field = (typeof FIELDS)[number];

export type DayStats = { emails: number; doors: number; followups: number; posts: number; notes: string };
export type Lead = { id: number; business: string; contact: string; status: string; next_followup: string | null; notes: string };
export type RecentDay = { date: string; emails: number; doors: number; followups: number; posts: number };
export type TrackerData = { today: DayStats; leads: Lead[]; recent: RecentDay[] };

let ready = false;
async function ensure() {
  if (ready) return;
  await sql`CREATE TABLE IF NOT EXISTS daily_grind (
    log_date text PRIMARY KEY,
    emails int NOT NULL DEFAULT 0,
    doors int NOT NULL DEFAULT 0,
    followups int NOT NULL DEFAULT 0,
    posts int NOT NULL DEFAULT 0,
    notes text NOT NULL DEFAULT ''
  )`;
  await sql`CREATE TABLE IF NOT EXISTS grind_leads (
    id serial PRIMARY KEY,
    business text NOT NULL,
    contact text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'New',
    next_followup text,
    notes text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  ready = true;
}

const EMPTY: DayStats = { emails: 0, doors: 0, followups: 0, posts: 0, notes: "" };

export async function getTrackerData(date: string): Promise<TrackerData> {
  requireOwner();
  await ensure();
  const dayRows = (await sql`SELECT emails, doors, followups, posts, notes FROM daily_grind WHERE log_date = ${date}`) as unknown as DayStats[];
  const today = dayRows[0] ? { ...dayRows[0] } : { ...EMPTY };
  const leadRows = (await sql`
    SELECT id, business, contact, status, next_followup, notes FROM grind_leads
    ORDER BY (next_followup IS NULL), next_followup ASC, id DESC
  `) as unknown as Lead[];
  const recentRows = (await sql`
    SELECT log_date, emails, doors, followups, posts FROM daily_grind ORDER BY log_date DESC LIMIT 7
  `) as unknown as { log_date: string; emails: number; doors: number; followups: number; posts: number }[];
  const recent = recentRows.map((r) => ({ date: r.log_date, emails: r.emails, doors: r.doors, followups: r.followups, posts: r.posts }));
  return { today, leads: leadRows, recent };
}

export async function bumpStat(date: string, field: string, delta: number): Promise<TrackerData> {
  requireOwner();
  await ensure();
  if ((FIELDS as readonly string[]).includes(field)) {
    await sql`INSERT INTO daily_grind (log_date) VALUES (${date}) ON CONFLICT (log_date) DO NOTHING`;
    await sql`UPDATE daily_grind SET ${sql(field)} = GREATEST(0, ${sql(field)} + ${delta}) WHERE log_date = ${date}`;
  }
  return getTrackerData(date);
}

export async function saveNotes(date: string, notes: string): Promise<TrackerData> {
  requireOwner();
  await ensure();
  await sql`INSERT INTO daily_grind (log_date, notes) VALUES (${date}, ${notes})
    ON CONFLICT (log_date) DO UPDATE SET notes = ${notes}`;
  return getTrackerData(date);
}

export async function addLead(date: string, business: string, contact: string, notes: string): Promise<TrackerData> {
  requireOwner();
  await ensure();
  if (business.trim()) {
    await sql`INSERT INTO grind_leads (business, contact, notes) VALUES (${business.trim()}, ${contact.trim()}, ${notes.trim()})`;
  }
  return getTrackerData(date);
}

export async function updateLead(
  date: string,
  id: number,
  patch: { status?: string; next_followup?: string | null; notes?: string },
): Promise<TrackerData> {
  requireOwner();
  await ensure();
  if (patch.status !== undefined) await sql`UPDATE grind_leads SET status = ${patch.status}, updated_at = now() WHERE id = ${id}`;
  if (patch.next_followup !== undefined) await sql`UPDATE grind_leads SET next_followup = ${patch.next_followup}, updated_at = now() WHERE id = ${id}`;
  if (patch.notes !== undefined) await sql`UPDATE grind_leads SET notes = ${patch.notes}, updated_at = now() WHERE id = ${id}`;
  return getTrackerData(date);
}

// Mark a lead followed up today: bumps the day's follow-up count, sets the next date.
export async function logFollowUp(date: string, id: number, nextDate: string | null): Promise<TrackerData> {
  requireOwner();
  await ensure();
  await sql`UPDATE grind_leads SET status = 'Follow up', next_followup = ${nextDate}, updated_at = now() WHERE id = ${id}`;
  await sql`INSERT INTO daily_grind (log_date) VALUES (${date}) ON CONFLICT (log_date) DO NOTHING`;
  await sql`UPDATE daily_grind SET followups = followups + 1 WHERE log_date = ${date}`;
  return getTrackerData(date);
}

export async function deleteLead(date: string, id: number): Promise<TrackerData> {
  requireOwner();
  await ensure();
  await sql`DELETE FROM grind_leads WHERE id = ${id}`;
  return getTrackerData(date);
}
