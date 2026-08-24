/* =====================================================================
   META LEADS CENTRE, parse the exported leads.csv
   ---------------------------------------------------------------------
   Each lead carries its ad_id (in the Labels column) and its Stage
   (Intake / Qualified / Converted / Follow Up / Abused). We pull those
   out so the ops manager can flag the follow-up backlog and attribute
   conversions to ads.
   ===================================================================== */

export interface LeadRecord {
  name: string;
  email: string;
  phone: string;
  source: string; // Paid / Organic
  channel: string; // Messenger / Instagram / …
  stage: string;
  ad_id: string; // extracted from Labels
  created_date: string; // YYYY-MM-DD ("" if unparseable)
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += c;
    } else {
      if (c === '"') q = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else if (c === "\r") { /* skip */ }
      else cur += c;
    }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

/** Leads Centre exports US-format dates like "08/08/2026 6:53am" (MM/DD/YYYY). */
function parseDate(s: string): string {
  const m = (s || "").match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return "";
  return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
}

export function parseLeadsCsv(text: string): LeadRecord[] {
  const rows = parseCSV(text).filter((r) => r.length > 1);
  if (!rows.length) return [];
  const H = rows[0].map((h) => h.trim().toLowerCase());
  const ci = (...names: string[]) => { for (const n of names) { const i = H.indexOf(n); if (i >= 0) return i; } return -1; };
  const iName = ci("name"), iEmail = ci("email address", "email"), iSource = ci("source"),
    iChannel = ci("channel"), iStage = ci("stage"), iLabels = ci("labels"),
    iPhone = ci("phone"), iCreated = ci("created", "created time");
  const g = (row: string[], i: number) => (i >= 0 ? (row[i] || "").trim() : "");
  const out: LeadRecord[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const nm = g(row, iName);
    if (!nm) continue;
    const m = g(row, iLabels).match(/ad_id\.(\d+)/);
    out.push({
      name: nm.slice(0, 80),
      email: g(row, iEmail).slice(0, 120),
      phone: g(row, iPhone).slice(0, 40),
      source: g(row, iSource).slice(0, 20),
      channel: g(row, iChannel).slice(0, 20),
      stage: g(row, iStage).slice(0, 40),
      ad_id: m ? m[1] : "",
      created_date: parseDate(g(row, iCreated)),
    });
  }
  return out;
}
