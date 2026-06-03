import { BUSINESS } from "./config";
import { toIcsUtc } from "./time";
import type { ResolvedBooking } from "./types";

function esc(s: string): string {
  return String(s || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\n|\r/g, "\\n");
}

/** Build a calendar invite (.ics) string for a confirmed booking. */
export function buildIcs(b: ResolvedBooking): string {
  const uid = `${b.bookingId}@smithsdetailingservices.com.au`;
  const summary = `${BUSINESS.shortName} — ${b.packageName} (${b.vehicle})`;

  const descParts = [
    `Package: ${b.packageName}`,
    `Vehicle: ${b.vehicle}`,
    b.extras.length
      ? `Extras: ${b.extras.map((x) => `${x.label} ($${x.price})`).join(", ")}`
      : "Extras: None",
    `Total: $${b.totalPrice}`,
    `Address: ${b.address}`,
    b.notes ? `Notes: ${b.notes}` : "",
    "",
    `Questions? Call or text ${BUSINESS.phone}.`,
  ].filter(Boolean);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Smiths Detailing//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(b.start)}`,
    `DTEND:${toIcsUtc(b.end)}`,
    `SUMMARY:${esc(summary)}`,
    `DESCRIPTION:${esc(descParts.join("\n"))}`,
    `LOCATION:${esc(b.address)}`,
    `ORGANIZER;CN=${esc(BUSINESS.shortName)}:MAILTO:${BUSINESS.email}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}
