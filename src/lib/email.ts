import { Resend } from "resend";
import { BUSINESS, money } from "./config";
import { formatCairnsDate, formatCairnsTime } from "./time";
import { buildIcs } from "./ics";
import type { ResolvedBooking } from "./types";

const YELLOW = "#FFE600";
const GREEN = "#2bff7a";

function esc(s: string): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function detailsTable(b: ResolvedBooking): string {
  const extras = b.extras.length
    ? b.extras.map((x) => `${esc(x.label)} (${money(x.price)})`).join(", ")
    : "None";
  const rows: [string, string][] = [
    ["Date", formatCairnsDate(b.start)],
    ["Time", `${formatCairnsTime(b.start)} – ${formatCairnsTime(b.end)}`],
    ["Package", b.packageName],
    ["Vehicle", b.vehicle],
    ["Drop-off", b.address],
    ["Extras", extras],
    ["Total", `${money(b.totalPrice)} (pay on the day)`],
  ];
  return rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#9a9a9a;font-size:13px;vertical-align:top;white-space:nowrap;">${k}</td><td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">${esc(
          v
        )}</td></tr>`
    )
    .join("");
}

function customerHtml(b: ResolvedBooking): string {
  return `
  <div style="background:#0a0a0a;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#141414;border:1px solid #262626;border-radius:16px;overflow:hidden;">
      <div style="padding:22px 24px;border-bottom:1px solid #262626;">
        <div style="font-size:13px;letter-spacing:2px;color:${YELLOW};font-weight:700;">SMITHS DETAILING</div>
        <div style="font-size:22px;color:#fff;font-weight:800;margin-top:6px;">Booking confirmed ✅</div>
      </div>
      <div style="padding:22px 24px;color:#d6d6d6;font-size:14px;line-height:1.6;">
        <p style="margin:0 0 16px;">Hi ${esc(b.customerName.split(" ")[0] || "there")}, thanks for booking with Smiths Detailing. Here are your details:</p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 18px;">${detailsTable(b)}</table>
        <div style="background:rgba(43,255,122,.08);border:1px solid rgba(43,255,122,.3);border-radius:12px;padding:12px 14px;color:${GREEN};font-weight:700;font-size:14px;">
          💯 If you're not happy, you don't pay.
        </div>
        <p style="margin:18px 0 0;color:#9a9a9a;font-size:13px;">A calendar invite is attached. Need to change or cancel? Just reply to this email or text us on <b style="color:#fff;">${esc(
          BUSINESS.phone
        )}</b>.</p>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #262626;color:#7a7a7a;font-size:12px;">
        ${esc(BUSINESS.name)} • ${esc(BUSINESS.address)} • ${esc(BUSINESS.phone)}
      </div>
    </div>
  </div>`;
}

function ownerHtml(b: ResolvedBooking): string {
  return `
  <div style="background:#f4f4f4;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:580px;margin:0 auto;background:#fff;border:1px solid #e2e2e2;border-radius:14px;overflow:hidden;">
      <div style="background:#0a0a0a;padding:18px 22px;">
        <div style="color:${YELLOW};font-weight:800;font-size:16px;">NEW BOOKING</div>
      </div>
      <div style="padding:20px 22px;color:#222;font-size:14px;line-height:1.7;">
        <b>${esc(b.customerName)}</b> &nbsp;•&nbsp; <a href="tel:${esc(b.phone)}">${esc(b.phone)}</a> &nbsp;•&nbsp; <a href="mailto:${esc(b.email)}">${esc(b.email)}</a><br><br>
        <b>When:</b> ${formatCairnsDate(b.start)} — ${formatCairnsTime(b.start)} to ${formatCairnsTime(b.end)}<br>
        <b>Package:</b> ${esc(b.packageName)} (${esc(b.vehicle)})<br>
        <b>Drop-off:</b> ${esc(b.address)}<br>
        <b>Extras:</b> ${b.extras.length ? b.extras.map((x) => `${esc(x.label)} (${money(x.price)})`).join(", ") : "None"}<br>
        <b>Total:</b> ${money(b.totalPrice)}<br>
        ${b.notes ? `<b>Notes:</b> ${esc(b.notes)}<br>` : ""}
        <br><span style="color:#888;font-size:12px;">Booking ID: ${esc(b.bookingId)}</span>
      </div>
    </div>
  </div>`;
}

/** Sends the customer confirmation (with .ics) and the owner notification.
    Best-effort: never throws — booking is already saved before this runs. */
export async function sendBookingEmails(b: ResolvedBooking): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping emails.");
    return;
  }

  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM || "Smiths Detailing <onboarding@resend.dev>";
  const ownerEmail = process.env.OWNER_EMAIL || BUSINESS.email;
  const ics = Buffer.from(buildIcs(b), "utf-8");

  try {
    await resend.emails.send({
      from,
      to: b.email,
      replyTo: ownerEmail,
      subject: "Your Smiths Detailing booking is confirmed ✅",
      html: customerHtml(b),
      attachments: [{ filename: "smiths-booking.ics", content: ics }],
    });
  } catch (e) {
    console.error("Customer email failed:", e);
  }

  try {
    await resend.emails.send({
      from,
      to: ownerEmail,
      replyTo: b.email,
      subject: `New booking — ${b.customerName} — ${b.packageName}`,
      html: ownerHtml(b),
    });
  } catch (e) {
    console.error("Owner email failed:", e);
  }
}
