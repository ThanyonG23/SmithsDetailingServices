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
  uid: string; // stable calendar event id — hours are keyed to this
  booking_date: string; // YYYY-MM-DD
  value: number;
  is_correction: boolean;
  summary: string;
}

const BS = String.fromCharCode(92); // backslash
const num = (s?: string) => (s ? parseFloat(String(s).replace(/,/g, "")) : 0);
const clean = (t: string) =>
  t.split(BS + "n").join(" ").split(BS).join("").trim();

/* Return the Cairns (Australia/Brisbane, UTC+10, no DST) calendar date for
   an event's DTSTART. Google stores timed events in UTC ("...T210000Z"), so
   a 7am Cairns job is 21:00 UTC the DAY BEFORE — take the UTC date and it
   reads a day early. Convert UTC → +10 first. TZID-local and all-day DATE
   values are already local, so use them as-is. */
function brisbaneDate(e: string): string | null {
  const m = e.match(/DTSTART[^:\n]*:(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/);
  if (!m) return null;
  const [, y, mo, d, hh, mm, ss, z] = m;
  if (z) {
    const t =
      Date.UTC(+y, +mo - 1, +d, +hh, +mm, +ss) + 10 * 3600 * 1000; // +10h → Brisbane
    const b = new Date(t);
    return `${b.getUTCFullYear()}-${String(b.getUTCMonth() + 1).padStart(2, "0")}-${String(
      b.getUTCDate()
    ).padStart(2, "0")}`;
  }
  return `${y}-${mo}-${d}`;
}

/* ---- customers (for the CRM) --------------------------------------- */

export interface CustomerRecord {
  key: string; // dedupe key: normalised phone, else email
  name: string;
  phone: string;
  email: string;
  car: string;
  value: number;
  date: string; // YYYY-MM-DD
}

const FIELD_LABELS =
  "Phone|Mobile|Mob|Ph|Email|E-mail|Car|Vehicle|Make|Model|Quote|Total|Price|Extras|Reg|Rego|Registration|Address|Name|Colour|Color|Notes";
function fieldFrom(blob: string, labelAlt: string): string {
  const re = new RegExp(
    "(?:" + labelAlt + ")\\s*:\\s*(.+?)\\s*(?:(?:" + FIELD_LABELS + ")\\s*:|$)",
    "i"
  );
  const m = blob.match(re);
  return m ? m[1].trim() : "";
}

/** Pull customer contact details out of the calendar. Only events that carry
    a phone or email (i.e. real customer bookings, not internal notes). */
export function parseCustomersIcs(rawInput: string): CustomerRecord[] {
  const raw = rawInput.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
  const events = raw.split("BEGIN:VEVENT").slice(1);
  const out: CustomerRecord[] = [];
  for (const e of events) {
    const date = brisbaneDate(e);
    if (!date) continue;
    let summary = (e.match(/\nSUMMARY:([\s\S]*?)(?:\n[A-Z-]+[:;])/) || [])[1] || "";
    let desc = (e.match(/\nDESCRIPTION:([\s\S]*?)(?:\n[A-Z-]+[:;])/) || [])[1] || "";
    summary = clean(summary);
    desc = clean(desc);
    const blob = summary + " " + desc;

    const emailM = blob.match(/[\w.+-]+@[\w-]+\.[\w.-]{2,}/);
    const email = emailM ? emailM[0].toLowerCase() : "";
    const phoneDigits = (fieldFrom(blob, "Phone|Mobile|Mob|Ph").match(/\d/g) || []).join("");
    const phone = phoneDigits.length >= 8 ? phoneDigits.slice(0, 15) : "";
    if (!phone && !email) continue; // real customers only

    const name = (summary.split(":")[0] || "").trim().slice(0, 80);
    const car = fieldFrom(blob, "Car|Vehicle|Make").slice(0, 80);
    const value = num((blob.match(/(?:Total|Quote):\s*\$?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i) || [])[1]);

    out.push({ key: phone || email, name, phone, email, car, value, date });
  }
  return out;
}

export function parseBookingsIcs(rawInput: string): Booking[] {
  const raw = rawInput.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, ""); // unfold
  const events = raw.split("BEGIN:VEVENT").slice(1);
  const out: Booking[] = [];
  for (const e of events) {
    const booking_date = brisbaneDate(e);
    if (!booking_date) continue;
    const uidRaw = (e.match(/\nUID:([^\n]+)/) || [])[1] || "";
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
      uid: (uidRaw.trim() || `${booking_date}|${value}|${summary.slice(0, 24)}`).slice(0, 200),
      booking_date,
      value,
      // Only trust the job TITLE for the package type — descriptions often
      // mention "coating/correction" in upsell notes and cause false hits.
      // Value ≥ $1,500 is a safe correction signal for the current pricing.
      is_correction: value >= 1500 || /correction|coating|ceramic/i.test(summary),
      summary: summary.slice(0, 200),
    });
  }
  return out;
}
