/* Parse a Meta (Facebook) Ads CSV export into per-ad rows.
   Robust to column order, finds columns by header name. The export is a
   date-range summary (one row per ad), so each upload replaces the snapshot. */

export interface AdRow {
  name: string;
  spend: number;
  messages: number; // messaging conversations started
  new_contacts: number;
  purchases: number;
  impressions: number;
  reach: number;
  cost_per_message: number;
}

function parseLine(line: string): string[] {
  const out: string[] = [];
  let cur = "",
    q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else q = false;
      } else cur += ch;
    } else {
      if (ch === '"') q = true;
      else if (ch === ",") {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

const num = (s: string | undefined) =>
  parseFloat(String(s || "").replace(/[^0-9.\-]/g, "")) || 0;

/** Reporting date range across the export (min "Reporting starts" / max
    "Reporting ends"), as YYYY-MM-DD. Used to record daily Meta leads. */
export function parseAdsPeriod(text: string): { start: string | null; end: string | null } {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { start: null, end: null };
  const hdr = parseLine(lines[0]).map((h) => h.toLowerCase().trim());
  const iStart = hdr.findIndex((h) => h.includes("reporting starts"));
  const iEnd = hdr.findIndex((h) => h.includes("reporting ends"));
  let start: string | null = null;
  let end: string | null = null;
  for (let i = 1; i < lines.length; i++) {
    const f = parseLine(lines[i]);
    const s = iStart >= 0 ? (f[iStart] || "").trim().slice(0, 10) : "";
    const e = iEnd >= 0 ? (f[iEnd] || "").trim().slice(0, 10) : "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(s) && (!start || s < start)) start = s;
    if (/^\d{4}-\d{2}-\d{2}$/.test(e) && (!end || e > end)) end = e;
  }
  return { start, end };
}

/** Per-day Meta messages, from rows that cover a single day (start == end).
    Works for a "today only" export AND a Day-breakdown export (one row per ad
    per day), so one upload can backfill every day. Range summaries are
    skipped (their rows span the whole period and can't be attributed daily). */
export function parseAdsDailyMessages(text: string): { date: string; messages: number }[] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const hdr = parseLine(lines[0]).map((h) => h.toLowerCase().trim());
  const iStart = hdr.findIndex((h) => h.includes("reporting starts"));
  const iEnd = hdr.findIndex((h) => h.includes("reporting ends"));
  const iMsg =
    hdr.findIndex((h) => h.includes("messaging conversations started")) >= 0
      ? hdr.findIndex((h) => h.includes("messaging conversations started"))
      : hdr.findIndex((h) => h.includes("total messaging contacts"));
  const byDay: Record<string, number> = {};
  for (let i = 1; i < lines.length; i++) {
    const f = parseLine(lines[i]);
    const s = iStart >= 0 ? (f[iStart] || "").trim().slice(0, 10) : "";
    const e = iEnd >= 0 ? (f[iEnd] || "").trim().slice(0, 10) : "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || s !== e) continue; // per-day rows only
    byDay[s] = (byDay[s] || 0) + (iMsg >= 0 ? num(f[iMsg]) : 0);
  }
  return Object.entries(byDay).map(([date, m]) => ({ date, messages: Math.round(m) }));
}

export function parseAdsCsv(text: string): AdRow[] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const hdr = parseLine(lines[0]).map((h) => h.toLowerCase().trim());
  const has = (needle: string) => hdr.findIndex((h) => h.includes(needle));
  const exact = (name: string) => hdr.findIndex((h) => h === name);

  // Accept both the ad-level ("Ad name") and campaign-level ("Campaign name")
  // Meta exports, either one uploads fine.
  const iName = has("ad name") >= 0 ? has("ad name") : has("campaign name");
  const iSpend = has("amount spent");
  const iImpr = exact("impressions");
  const iReach = exact("reach");
  const iMsg =
    has("messaging conversations started") >= 0
      ? has("messaging conversations started")
      : has("total messaging contacts");
  const iNew = has("new messaging contacts");
  const iPur = exact("purchases") >= 0 ? exact("purchases") : has("purchases");

  const rows: AdRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const f = parseLine(lines[i]);
    const name = (f[iName] || "").trim();
    if (!name) continue;
    const spend = num(f[iSpend]);
    const messages = iMsg >= 0 ? num(f[iMsg]) : 0;
    rows.push({
      name,
      spend,
      messages,
      new_contacts: iNew >= 0 ? num(f[iNew]) : 0,
      purchases: iPur >= 0 ? num(f[iPur]) : 0,
      impressions: iImpr >= 0 ? num(f[iImpr]) : 0,
      reach: iReach >= 0 ? num(f[iReach]) : 0,
      cost_per_message: messages ? spend / messages : 0,
    });
  }
  return rows;
}
