/* =====================================================================
   OPS — Google Calendar (.ics) parser
   ---------------------------------------------------------------------
   Ashlee uploads the "Smiths Bookings" calendar export (.zip or .ics);
   this pulls each booking's date + dollar value out of the event.
   Values live in the SUMMARY/DESCRIPTION as "Total:" or "Quote:".
   iCal escapes commas as \,  so $1\,500 must have the backslash stripped
   or every job over $1,000 silently reads as $1.
   ===================================================================== */

export interface Booking {
  booking_date: string; // YYYY-MM-DD
  value: number;
  is_correction: boolean;
  summary: string;
}

const BS = String.fromCharCode(92); // backslash
const num = (s?: string) => (s ? parseFloat(String(s).replace(/,/g, "")) : 0);
const clean = (t: string) =>
  t.split(BS + "n").join(" ").split(BS).join("").trim();

export function parseBookingsIcs(rawInput: string): Booking[] {
  const raw = rawInput.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, ""); // unfold
  const events = raw.split("BEGIN:VEVENT").slice(1);
  const out: Booking[] = [];
  for (const e of events) {
    const dt = (e.match(/DTSTART[^:]*:(\d{8})/) || [])[1];
    if (!dt) continue;
    let summary = (e.match(/\nSUMMARY:([\s\S]*?)(?:\n[A-Z-]+[:;])/) || [])[1] || "";
    let desc = (e.match(/\nDESCRIPTION:([\s\S]*?)(?:\n[A-Z-]+[:;])/) || [])[1] || "";
    summary = clean(summary);
    desc = clean(desc);
    const blob = summary + " " + desc;

    const tot = num((blob.match(/Total:\s*\$?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i) || [])[1]);
    const quo = num((blob.match(/Quote:\s*\$?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i) || [])[1]);
    let value = tot || quo;
    if (!value) {
      const all = [...blob.matchAll(/\$\s*([0-9,]+(?:\.[0-9]{1,2})?)/g)]
        .map((m) => num(m[1]))
        .filter((v) => v >= 50 && v <= 20000);
      if (all.length) value = Math.max(...all);
    }

    out.push({
      booking_date: `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}`,
      value,
      is_correction: value >= 1500 || /correction|coating|ceramic/i.test(blob),
      summary: summary.slice(0, 200),
    });
  }
  return out;
}
