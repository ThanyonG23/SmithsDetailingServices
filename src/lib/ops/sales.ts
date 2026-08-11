/* Parse a Xero "SalesInvoices" CSV export into one row per invoice.
   The export is line-item level (one row per invoice line), so we dedupe by
   InvoiceNumber and take the invoice Total once. Robust to column order. */

export interface SaleRow {
  invoice_number: string;
  contact_name: string;
  email: string;
  invoice_date: string; // YYYY-MM-DD
  total: number; // incl GST
  status: string;
  description: string;
}

/** Normalise a name for fuzzy matching to leads/bookings. */
export function normName(s: string): string {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCSV(text: string): Record<string, string>[] {
  text = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let f = "",
    row: string[] = [],
    q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          f += '"';
          i++;
        } else q = false;
      } else f += c;
    } else {
      if (c === '"') q = true;
      else if (c === ",") {
        row.push(f);
        f = "";
      } else if (c === "\n") {
        row.push(f);
        rows.push(row);
        row = [];
        f = "";
      } else if (c !== "\r") f += c;
    }
  }
  if (f.length || row.length) {
    row.push(f);
    rows.push(row);
  }
  const head = (rows.shift() || []).map((h) => h.trim());
  return rows
    .filter((r) => r.length > 1)
    .map((r) => {
      const o: Record<string, string> = {};
      head.forEach((h, i) => (o[h] = r[i] ?? ""));
      return o;
    });
}

const num = (v: string | undefined) => {
  const n = parseFloat(String(v || "").replace(/[^0-9.\-]/g, ""));
  return isNaN(n) ? 0 : n;
};

/** Xero dates come as D/M/YYYY. */
function toISO(s: string): string {
  const m = String(s || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  const iso = String(s || "").match(/^\d{4}-\d{2}-\d{2}/);
  return iso ? iso[0] : "";
}

export function parseSalesCsv(text: string): SaleRow[] {
  const rows = parseCSV(text);
  if (!rows.length) return [];
  const byInv = new Map<string, SaleRow>();
  for (const r of rows) {
    const inv = (r["InvoiceNumber"] || r["Invoice Number"] || "").trim();
    if (!inv) continue;
    const type = (r["Type"] || "Sales invoice").toLowerCase();
    if (type && !type.includes("sales")) continue; // ignore credit notes etc.
    const desc = (r["Description"] || "").trim();
    const existing = byInv.get(inv);
    if (existing) {
      if (desc) existing.description = existing.description ? `${existing.description}; ${desc}` : desc;
      continue;
    }
    byInv.set(inv, {
      invoice_number: inv,
      contact_name: (r["ContactName"] || r["Contact"] || "").trim(),
      email: (r["EmailAddress"] || r["Email"] || "").trim().toLowerCase(),
      invoice_date: toISO(r["InvoiceDate"] || r["Date"] || ""),
      total: num(r["Total"]),
      status: (r["Status"] || "").trim(),
      description: desc,
    });
  }
  return [...byInv.values()].filter((s) => s.invoice_date);
}
