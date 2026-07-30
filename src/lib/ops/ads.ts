/* Parse a Meta (Facebook) Ads CSV export into per-ad rows.
   Robust to column order — finds columns by header name. The export is a
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

export function parseAdsCsv(text: string): AdRow[] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const hdr = parseLine(lines[0]).map((h) => h.toLowerCase().trim());
  const has = (needle: string) => hdr.findIndex((h) => h.includes(needle));
  const exact = (name: string) => hdr.findIndex((h) => h === name);

  const iName = has("ad name");
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
