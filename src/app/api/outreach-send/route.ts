import { NextResponse } from "next/server";
import { sql } from "@/lib/ops/db";
import { ensureOutreach } from "@/app/ops/outreach/actions";
import { sendMail, hasReplied, mailerConfigured } from "@/lib/ops/mailer";

/* Hourly outreach sender. Hit by an external cron (cron-job.org) once an hour
   with ?token=OUTREACH_CRON_TOKEN. Each run sends at most ONE email so the pace
   stays ~1/hour. Window: every day, 7am-9pm Cairns time. Sequence: initial, then
   a follow-up at day 2 and day 7, then stop. Before any follow-up it checks the
   inbox for a reply and stops the sequence if the business has answered. */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const START_HOUR = 7; // 7am
const END_HOUR = 22; // send through the 9pm hour (skip once hour >= 22)
const MIN_GAP_MIN = 50; // keep roughly one per hour even if the cron double-fires
const DAILY_CAP = 16;
const OPT_OUT = "\n\nNot interested? Just reply and I will take you off my list.";

const j = (body: unknown, status = 200) => NextResponse.json(body, { status });

function greetName(body: string): string {
  const m = String(body || "").match(/Hey\s+([^,\n]+),/i);
  const n = (m?.[1] || "").trim();
  return n && n.toLowerCase() !== "there" ? n : "Mate";
}

function followup1(name: string, business: string): string {
  return `Hey ${name}, just floating this back to the top of your inbox.

We have still got a giveaway slot open and I would love it to be ${business}. It costs you nothing but one prize, we do all the content and put you in front of our whole local audience.

See how it works: smithsdetailingservices.com.au/partners

Worth a quick chat? Or just reply and I will take you off my list.

Thanyon
Smiths Detailing Services`;
}

function followup2(name: string, business: string): string {
  return `Hey ${name}, last one from me, I promise.

If the timing is not right, no worries at all. But if you would like the free giveaway feature for ${business} before the slot goes, just reply here or text me on 0456 186 696.

smithsdetailingservices.com.au/partners

Thanyon
Smiths Detailing Services`;
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || req.headers.get("x-cron-token") || "";
  if (!process.env.OUTREACH_CRON_TOKEN || token !== process.env.OUTREACH_CRON_TOKEN) {
    return j({ ok: false, error: "unauthorised" }, 401);
  }
  if (!mailerConfigured()) {
    return j({ ok: false, error: "GMAIL_USER / GMAIL_APP_PASSWORD not set in Vercel" }, 503);
  }
  await ensureOutreach();

  // Time window + rate + daily cap, all evaluated in Cairns time via Postgres.
  const clock = (await sql`SELECT
    extract(hour from (now() AT TIME ZONE 'Australia/Brisbane'))::int AS h,
    (SELECT count(*)::int FROM outreach_leads WHERE last_sent_at IS NOT NULL
       AND (last_sent_at AT TIME ZONE 'Australia/Brisbane')::date = (now() AT TIME ZONE 'Australia/Brisbane')::date) AS sent_today,
    (SELECT extract(epoch from (now() - max(last_sent_at)))/60 FROM outreach_leads) AS mins_since_last
  `) as unknown as { h: number; sent_today: number; mins_since_last: number | null }[];
  const { h, sent_today, mins_since_last } = clock[0];

  // ?force=1 bypasses the window/rate/cap guards, for a manual self-test.
  const force = new URL(req.url).searchParams.get("force") === "1";
  if (!force) {
    if (h < START_HOUR || h >= END_HOUR) return j({ ok: true, sent: 0, skipped: `outside send window (Cairns hour ${h})` });
    if (mins_since_last !== null && mins_since_last < MIN_GAP_MIN) {
      return j({ ok: true, sent: 0, skipped: `rate limit, last send ${Math.round(mins_since_last)}m ago` });
    }
    if (sent_today >= DAILY_CAP) return j({ ok: true, sent: 0, skipped: `daily cap ${DAILY_CAP} reached` });
  }

  // 1) Follow-ups that are due. Reply-check each before sending.
  const followups = (await sql`
    SELECT id, email, business, subject, body, sent_at, stage FROM outreach_leads
    WHERE approved AND NOT replied AND NOT stopped AND NOT bounced AND email <> ''
      AND stage IN (1, 2) AND next_action_at IS NOT NULL AND next_action_at <= now()
    ORDER BY next_action_at ASC LIMIT 5
  `) as unknown as { id: number; email: string; business: string; subject: string; body: string; sent_at: string; stage: number }[];

  for (const l of followups) {
    if (l.sent_at && (await hasReplied(l.email, new Date(l.sent_at)))) {
      await sql`UPDATE outreach_leads SET replied = true, updated_at = now() WHERE id = ${l.id}`;
      continue; // they answered, try the next candidate instead
    }
    const name = greetName(l.body);
    const text = (l.stage === 1 ? followup1(name, l.business) : followup2(name, l.business)) + OPT_OUT;
    const subject = "Re: " + (l.subject || "Cairns, you have seen our marketing");
    const res = await sendMail(l.email, subject, text);
    if (res.ok) {
      if (l.stage === 1) {
        await sql`UPDATE outreach_leads SET stage = 2, last_sent_at = now(),
          next_action_at = now() + interval '5 days', send_error = '', updated_at = now() WHERE id = ${l.id}`;
      } else {
        await sql`UPDATE outreach_leads SET stage = 3, last_sent_at = now(),
          next_action_at = null, send_error = '', updated_at = now() WHERE id = ${l.id}`;
      }
      return j({ ok: true, sent: 1, type: `follow-up ${l.stage}`, to: l.email, business: l.business });
    }
    // Send failed, park it a day so it doesn't block the queue, record the error.
    await sql`UPDATE outreach_leads SET send_error = ${res.error || "send failed"},
      next_action_at = now() + interval '1 day', updated_at = now() WHERE id = ${l.id}`;
    return j({ ok: false, error: res.error, to: l.email });
  }

  // 2) Otherwise, the next fresh approved lead.
  const fresh = (await sql`
    SELECT id, email, business, subject, body FROM outreach_leads
    WHERE approved AND stage = 0 AND NOT stopped AND NOT bounced AND email <> '' AND body <> ''
    ORDER BY id ASC LIMIT 1
  `) as unknown as { id: number; email: string; business: string; subject: string; body: string }[];

  if (fresh[0]) {
    const l = fresh[0];
    const res = await sendMail(l.email, l.subject || "Cairns, you have seen our marketing", (l.body || "") + OPT_OUT);
    if (res.ok) {
      await sql`UPDATE outreach_leads SET stage = 1, status = 'sent', sent_at = now(), last_sent_at = now(),
        next_action_at = now() + interval '2 days', send_error = '', updated_at = now() WHERE id = ${l.id}`;
      return j({ ok: true, sent: 1, type: "initial", to: l.email, business: l.business });
    }
    await sql`UPDATE outreach_leads SET send_error = ${res.error || "send failed"}, updated_at = now() WHERE id = ${l.id}`;
    return j({ ok: false, error: res.error, to: l.email });
  }

  return j({ ok: true, sent: 0, note: "nothing due to send" });
}
