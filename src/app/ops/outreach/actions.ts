"use server";

import { requireOwner } from "@/lib/ops/auth";
import { sql } from "@/lib/ops/db";

/* Outreach tool: paste business listings / URLs, Claude scans each website and
   writes a personalised giveaway-partner cold email, then the owner sends each
   one from their own Gmail via a compose link (no auto-blasting, keeps the
   account safe and stays Spam-Act compliant). One lazily-created table. Reads
   run sequentially (the pooler deadlocks on parallel reads). */

export type Lead = {
  id: number;
  url: string;
  business: string;
  email: string;
  phone: string;
  channel: string;
  personalisation: string;
  prize: string;
  subject: string;
  body: string;
  sms: string;
  status: string; // new | written | sent | skipped
  error: string;
};

let ready = false;
async function ensure() {
  if (ready) return;
  await sql`CREATE TABLE IF NOT EXISTS outreach_leads (
    id serial PRIMARY KEY,
    url text NOT NULL DEFAULT '',
    business text NOT NULL DEFAULT '',
    email text NOT NULL DEFAULT '',
    phone text NOT NULL DEFAULT '',
    channel text NOT NULL DEFAULT '',
    personalisation text NOT NULL DEFAULT '',
    prize text NOT NULL DEFAULT '',
    subject text NOT NULL DEFAULT '',
    body text NOT NULL DEFAULT '',
    sms text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'new',
    error text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  ready = true;
}

export async function getOutreach(): Promise<Lead[]> {
  requireOwner();
  await ensure();
  const rows = (await sql`
    SELECT id, url, business, email, phone, channel, personalisation, prize, subject, body, sms, status, error
    FROM outreach_leads ORDER BY id DESC
  `) as unknown as Lead[];
  return rows;
}

// Pull a real https URL out of a pasted line, unwrapping Google redirect links.
function extractUrl(line: string): string | null {
  const raw = line.trim();
  if (!raw) return null;
  const m = raw.match(/https?:\/\/[^\s]+/i);
  if (!m) return null;
  let u = m[0].replace(/[)>,.]+$/, "");
  // Unwrap google.com/url?url=<real>&... redirect wrappers.
  if (/google\.[a-z.]+\/url/i.test(u)) {
    try {
      const inner = new URL(u).searchParams.get("url") || new URL(u).searchParams.get("q");
      if (inner) u = decodeURIComponent(inner);
    } catch {
      /* ignore */
    }
  }
  return u;
}

export async function addUrls(text: string): Promise<Lead[]> {
  requireOwner();
  await ensure();
  const lines = String(text || "").split(/\r?\n/);
  const urls: string[] = [];
  for (const line of lines) {
    const u = extractUrl(line);
    if (u) urls.push(u);
  }
  // Dedupe against what's already in the table and within this paste.
  const existing = (await sql`SELECT url FROM outreach_leads`) as unknown as { url: string }[];
  const seen = new Set(existing.map((r) => r.url));
  for (const u of urls) {
    if (seen.has(u)) continue;
    seen.add(u);
    await sql`INSERT INTO outreach_leads (url, status) VALUES (${u}, 'new')`;
  }
  return getOutreach();
}

// Fetch a website and return a trimmed plain-text version for the model.
async function fetchSiteText(url: string): Promise<string> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15000);
  try {
    const r = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "Mozilla/5.0 (compatible; SmithsOutreach/1.0)" },
      redirect: "follow",
    });
    const html = await r.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, 6000);
  } finally {
    clearTimeout(t);
  }
}

const SYSTEM_PROMPT = `You write cold outreach for Thanyon from Smiths Detailing Services in Cairns, Australia.

Smiths runs local giveaways to a growing Cairns audience. The offer (an attraction offer) invites a local business to be the PRIZE in the next giveaway, for free: Smiths comes and shoots a batch of content, features the business through the whole giveaway and the winner reveal to the entire local audience, gives a direct link back, and the business keeps the content. Their only cost is one prize. Plus a guarantee: if they do not feel they got enough value, Thanyon refunds the cost of their prize.

You are given the plain text of ONE business's website. Do two things:
1. Extract, using ONLY what is actually on the site (never invent): business name; contact email (or ""); phone (or ""); the best channel to reach them (one of: email, phone, socials, form, none); ONE genuine specific personalisation detail; and a suggested giveaway prize that fits their business.
2. Write the personalised email (subject + body) and a short SMS version.

Follow this template closely, swapping in the personalisation, business name and prize:

Subject: Cairns, you have seen our marketing

Hey [First name], Thanyon here from Smiths.

You have seen our marketing around Cairns. Three years, 500+ pieces, and $132k of our own money learning what gets this town's attention, so we launched giveaways to pull in even more.

[ONE personalised sentence tying their business to why they would be great in the giveaway], which is why I want to feature [Business] in our next giveaway. Here is the deal, and it costs you nothing:

- We come out and shoot a batch of pro content, featured across all our platforms
- [Business] featured through the whole giveaway and the winner reveal
- In front of our entire local audience, across multiple pages, links and social accounts
- A direct link straight back to your business
- Your only cost is one prize, [suggested prize] works perfectly

We only feature one business per giveaway, and the next slot is open right now.

I have put prizes into other people's giveaways myself, and my biggest regret was the ones who did not put the effort in. So if you feel I have not given you enough value, I will refund the cost of your prize. You genuinely cannot lose.

See exactly how it works: smithsdetailingservices.com.au/partners

Want it? Reply here or text me on 0456 186 696 and I will lock you in.

Thanyon
Smiths Detailing Services

RULES:
- If you find an owner or contact first name on the site, use it in the greeting; otherwise keep [First name].
- NEVER use em dashes or en dashes anywhere. Use commas.
- Australian spelling, warm, direct, human tone.
- Only reference details that are actually on the site. Never invent results, awards, reviews or facts.
- Keep the body close to the template length.
- SMS version: one short paragraph, no subject line, same offer, end with the link and "keen for a quick chat?".

Output STRICT JSON only, no markdown fences, with exactly these keys: business, email, phone, channel, personalisation, prize, subject, body, sms.`;

async function callClaude(model: string, key: string, siteText: string, url: string): Promise<string | null> {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model,
        max_tokens: 1600,
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: `Website URL: ${url}\n\nWebsite text:\n${siteText}` }],
      }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    const blocks = (data?.content || []) as { type?: string; text?: string }[];
    return (blocks.find((b) => b?.type === "text")?.text || blocks[0]?.text || "").trim() || null;
  } catch {
    return null;
  }
}

function parseJson(raw: string): Record<string, string> | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

const noDash = (s: string) => String(s || "").replace(/\s*[—–]\s*/g, ", ").replace(/,\s*,/g, ",");

export async function scanLead(id: number): Promise<Lead[]> {
  requireOwner();
  await ensure();
  const key = process.env.ANTHROPIC_API_KEY;
  const rows = (await sql`SELECT url FROM outreach_leads WHERE id = ${id}`) as unknown as { url: string }[];
  const url = rows[0]?.url;
  if (!url) return getOutreach();

  if (!key) {
    await sql`UPDATE outreach_leads SET status = 'new', error = 'ANTHROPIC_API_KEY not set in Vercel', updated_at = now() WHERE id = ${id}`;
    return getOutreach();
  }

  let siteText = "";
  try {
    siteText = await fetchSiteText(url);
  } catch {
    siteText = "";
  }
  if (!siteText) {
    await sql`UPDATE outreach_leads SET status = 'new', error = 'Could not read that website, add details manually', updated_at = now() WHERE id = ${id}`;
    return getOutreach();
  }

  let raw = await callClaude("claude-sonnet-5", key, siteText, url);
  if (!raw) raw = await callClaude("claude-haiku-4-5-20251001", key, siteText, url);
  const parsed = raw ? parseJson(raw) : null;
  if (!parsed) {
    await sql`UPDATE outreach_leads SET status = 'new', error = 'AI could not draft this one, try rescan', updated_at = now() WHERE id = ${id}`;
    return getOutreach();
  }

  await sql`UPDATE outreach_leads SET
    business = ${noDash(parsed.business || "")},
    email = ${(parsed.email || "").trim()},
    phone = ${(parsed.phone || "").trim()},
    channel = ${(parsed.channel || "").trim()},
    personalisation = ${noDash(parsed.personalisation || "")},
    prize = ${noDash(parsed.prize || "")},
    subject = ${noDash(parsed.subject || "Cairns, you have seen our marketing")},
    body = ${noDash(parsed.body || "")},
    sms = ${noDash(parsed.sms || "")},
    status = 'written',
    error = '',
    updated_at = now()
  WHERE id = ${id}`;
  return getOutreach();
}

export async function updateLead(
  id: number,
  patch: { subject?: string; body?: string; email?: string; status?: string },
): Promise<Lead[]> {
  requireOwner();
  await ensure();
  if (patch.subject !== undefined) await sql`UPDATE outreach_leads SET subject = ${patch.subject}, updated_at = now() WHERE id = ${id}`;
  if (patch.body !== undefined) await sql`UPDATE outreach_leads SET body = ${patch.body}, updated_at = now() WHERE id = ${id}`;
  if (patch.email !== undefined) await sql`UPDATE outreach_leads SET email = ${patch.email}, updated_at = now() WHERE id = ${id}`;
  if (patch.status !== undefined) await sql`UPDATE outreach_leads SET status = ${patch.status}, updated_at = now() WHERE id = ${id}`;
  return getOutreach();
}

export async function deleteLead(id: number): Promise<Lead[]> {
  requireOwner();
  await ensure();
  await sql`DELETE FROM outreach_leads WHERE id = ${id}`;
  return getOutreach();
}
