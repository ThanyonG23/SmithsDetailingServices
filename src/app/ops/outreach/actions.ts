"use server";

import { requireOwner } from "@/lib/ops/auth";
import { sql } from "@/lib/ops/db";

/* Outreach tool: paste a Google Maps results dump (names, categories, ratings,
   phones) OR website links. Claude writes a personalised giveaway-partner cold
   email + SMS for each, and the owner sends from their own Gmail (compose link)
   or texts the phone we parsed. No auto-blasting. One lazily-created table, reads
   run sequentially (the pooler deadlocks on parallel reads). */

export type Lead = {
  id: number;
  url: string;
  business: string;
  category: string;
  address: string;
  rating: string;
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
  // Migrate: fields that come from a Google Maps dump.
  await sql`ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS address text NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS rating text NOT NULL DEFAULT ''`;
  ready = true;
}

export async function getOutreach(): Promise<Lead[]> {
  requireOwner();
  await ensure();
  const rows = (await sql`
    SELECT id, url, business, category, address, rating, email, phone, channel,
           personalisation, prize, subject, body, sms, status, error
    FROM outreach_leads ORDER BY id DESC
  `) as unknown as Lead[];
  return rows;
}

// Pull a real https URL out of a line, unwrapping Google redirect links.
function extractUrl(line: string): string | null {
  const m = line.match(/https?:\/\/[^\s]+/i);
  if (!m) return null;
  let u = m[0].replace(/[)>,.]+$/, "");
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

type Parsed = { url: string; business: string; category: string; address: string; phone: string; rating: string };

const NOISE = new Set([
  "website", "directions", "sponsored", "visit site", "share", "all filters", "results", "rating", "hours",
  "update results when map moves", "back to top", "layers", "online estimates", "online appointments",
  "in-store shopping", "delivery", "pest control",
]);
const PHONE_RE = /(\(07\)\s?\d{4}\s?\d{4}|\(0\d\)\s?\d{4}\s?\d{4}|1300\s?\d{3}\s?\d{3}|13\s?\d{2}\s?\d{2}|0\d{3}\s?\d{3}\s?\d{3}|0\d\s?\d{4}\s?\d{4})/;
const RATING_RE = /^(\d(?:\.\d)?)\(([\d,]+)\)$/;
const CATEGORY_HINT = /service|store|gardener|landscaper|inspector|cleaner|supermarket|contractor|centre|center|collection|market|nursery|shop/i;

// Parse a Google Maps results dump into leads. Businesses appear as a duplicated
// name line, then rating / category+address / hours+phone lines. Also accepts
// standalone website URLs.
function parseListings(text: string): Parsed[] {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const out: Parsed[] = [];
  for (let i = 0; i < lines.length; i++) {
    const name = lines[i];
    const duplicated = lines[i + 1] === name && name.length >= 3 && !NOISE.has(name.toLowerCase());
    if (duplicated) {
      // Gather this business's block: the lines after the duplicated name, up to
      // the next duplicated-name marker (or a small window).
      const block: string[] = [];
      let j = i + 2;
      for (; j < lines.length && j < i + 10; j++) {
        if (lines[j + 1] === lines[j] && lines[j].length >= 3 && !NOISE.has(lines[j].toLowerCase())) break;
        block.push(lines[j]);
      }
      let rating = "", phone = "", category = "", address = "";
      for (const bl of block) {
        const rm = bl.match(RATING_RE);
        if (rm && !rating) { rating = `${rm[1]} (${rm[2]})`; continue; }
        if (/^no reviews$/i.test(bl) && !rating) { rating = "No reviews"; continue; }
        const isHours = /\b(open|closed|opens|closes|temporarily)\b/i.test(bl);
        if (!isHours && !category && bl.includes("·")) {
          const parts = bl.split("·").map((s) => s.trim()).filter(Boolean);
          category = parts[0] || "";
          address = parts.slice(1).join(", ");
          continue;
        }
        if (!isHours && !category && !PHONE_RE.test(bl) && CATEGORY_HINT.test(bl) && bl.length < 60) {
          category = bl;
          continue;
        }
      }
      // Phone: prefer the hours line, else anywhere in the block.
      for (const bl of block) {
        const pm = bl.match(PHONE_RE);
        if (pm) { phone = pm[0].replace(/\s+/g, " ").trim(); break; }
      }
      out.push({ url: "", business: name, category, address, phone, rating });
      i = j - 1;
      continue;
    }
    // Standalone URL line (when pasting website links instead of a Maps dump).
    const u = extractUrl(name);
    if (u) out.push({ url: u, business: "", category: "", address: "", phone: "", rating: "" });
  }
  return out;
}

export async function addListings(text: string): Promise<Lead[]> {
  requireOwner();
  await ensure();
  const parsed = parseListings(text);

  // Dedupe against existing rows and within this paste, by business name (Maps)
  // or by URL (link paste).
  const existing = (await sql`SELECT business, url FROM outreach_leads`) as unknown as { business: string; url: string }[];
  const seenBiz = new Set(existing.map((r) => r.business.toLowerCase()).filter(Boolean));
  const seenUrl = new Set(existing.map((r) => r.url).filter(Boolean));

  for (const p of parsed) {
    const bizKey = p.business.toLowerCase();
    if (p.business && seenBiz.has(bizKey)) continue;
    if (p.url && seenUrl.has(p.url)) continue;
    if (p.business) seenBiz.add(bizKey);
    if (p.url) seenUrl.add(p.url);
    await sql`INSERT INTO outreach_leads (url, business, category, address, phone, rating, status)
      VALUES (${p.url}, ${p.business}, ${p.category}, ${p.address}, ${p.phone}, ${p.rating}, 'new')`;
  }
  return getOutreach();
}

async function getHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15000);
  try {
    const r = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "Mozilla/5.0 (compatible; SmithsOutreach/1.0)" },
      redirect: "follow",
    });
    return await r.text();
  } finally {
    clearTimeout(t);
  }
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000);
}

// Pull real email addresses out of page HTML (mailto links and plain text),
// dropping image filenames and template junk, preferring the site's own domain.
function extractEmails(html: string, domain: string): string[] {
  const found = new Set<string>();
  const re = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  for (const m of html.matchAll(re)) {
    const e = m[0].toLowerCase();
    if (/\.(png|jpe?g|gif|webp|svg|ico|css|js)$/i.test(e)) continue;
    if (/(wix\.com|sentry|example\.|yourdomain|domain\.com|email\.com|@2x|\.wixpress)/i.test(e)) continue;
    found.add(e);
  }
  return [...found].sort((a, b) => (Number(b.endsWith(domain)) - Number(a.endsWith(domain)))).slice(0, 5);
}

// Fetch a site's text + any emails. If the homepage has no email, try the
// common contact pages (bounded, so it stays fast).
async function fetchSite(url: string): Promise<{ text: string; emails: string[] }> {
  let domain = "";
  try {
    domain = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    /* ignore */
  }
  const homeHtml = await getHtml(url);
  const text = htmlToText(homeHtml);
  let emails = extractEmails(homeHtml, domain);
  if (emails.length === 0) {
    for (const path of ["/contact", "/contact-us", "/contact.html"]) {
      try {
        const html = await getHtml(new URL(path, url).toString());
        emails = extractEmails(html, domain);
        if (emails.length) break;
      } catch {
        /* ignore */
      }
    }
  }
  return { text, emails };
}

const SYSTEM_PROMPT = `You write cold outreach for Thanyon from Smiths Detailing Services in Cairns, Australia.

Smiths runs local giveaways to a growing Cairns audience. The offer (an attraction offer) invites a local business to be the PRIZE in the next giveaway, for free: Smiths comes and shoots a batch of content, features the business through the whole giveaway and the winner reveal to the entire local audience, gives a direct link back, and the business keeps the content. Their only cost is one prize. Plus a guarantee: if they do not feel they got enough value, Thanyon refunds the cost of their prize.

You are given details about ONE business. This may include Google listing info (name, category, area/address, Google rating, phone) and, if available, the text of their website. Use whatever is provided.

Do two things:
1. Extract, using ONLY what is provided (never invent): business name; contact email (or "" if none is present); phone (or ""); the best channel to reach them (one of: email, phone, socials, form, none); ONE genuine specific personalisation detail; and a suggested giveaway prize that fits their business.
2. Write the personalised email (subject + body) and a short SMS version.

If no website text is provided, personalise from the listing, for example a strong review count ("a 5.0 from 316 reviews is seriously impressive"), their category, or their Cairns area/suburb. If no email is available, set email to "" and channel to "phone", and the SMS version is then the main way it will be sent.

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
- If you find an owner or contact first name, use it in the greeting; otherwise keep [First name].
- NEVER use em dashes or en dashes anywhere. Use commas.
- Australian spelling, warm, direct, human tone.
- Only reference details that are actually provided. Never invent results, awards, reviews or facts.
- Keep the body close to the template length.
- SMS version: one short paragraph, no subject line, same offer, end with the link and "keen for a quick chat?".

Output STRICT JSON only, no markdown fences, with exactly these keys: business, email, phone, channel, personalisation, prize, subject, body, sms.`;

async function callClaude(model: string, key: string, context: string): Promise<string | null> {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model,
        max_tokens: 1600,
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: context }],
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
  const rows = (await sql`
    SELECT url, business, category, address, rating, phone FROM outreach_leads WHERE id = ${id}
  `) as unknown as { url: string; business: string; category: string; address: string; rating: string; phone: string }[];
  const lead = rows[0];
  if (!lead) return getOutreach();

  if (!key) {
    await sql`UPDATE outreach_leads SET status = 'new', error = 'ANTHROPIC_API_KEY not set in Vercel', updated_at = now() WHERE id = ${id}`;
    return getOutreach();
  }

  let siteText = "";
  let foundEmails: string[] = [];
  if (lead.url) {
    try {
      const site = await fetchSite(lead.url);
      siteText = site.text;
      foundEmails = site.emails;
    } catch {
      siteText = "";
    }
  }

  if (!siteText && !lead.business) {
    await sql`UPDATE outreach_leads SET status = 'new', error = 'No website text and no listing details to work from', updated_at = now() WHERE id = ${id}`;
    return getOutreach();
  }

  const context = [
    lead.business ? `Business name: ${lead.business}` : "",
    lead.category ? `Category: ${lead.category}` : "",
    lead.address ? `Address / area: ${lead.address}` : "",
    lead.rating ? `Google rating: ${lead.rating}` : "",
    lead.phone ? `Phone: ${lead.phone}` : "",
    lead.url ? `Website: ${lead.url}` : "",
    foundEmails.length ? `Emails found on the website: ${foundEmails.join(", ")}` : "",
    siteText ? `Website text:\n${siteText}` : "(No website text available, personalise from the listing details above.)",
  ]
    .filter(Boolean)
    .join("\n");

  let raw = await callClaude("claude-sonnet-5", key, context);
  if (!raw) raw = await callClaude("claude-haiku-4-5-20251001", key, context);
  const parsed = raw ? parseJson(raw) : null;
  if (!parsed) {
    await sql`UPDATE outreach_leads SET status = 'new', error = 'AI could not draft this one, try rescan', updated_at = now() WHERE id = ${id}`;
    return getOutreach();
  }

  // Keep the phone we parsed from the listing if the model did not return one.
  const phone = (parsed.phone || "").trim() || lead.phone || "";
  // Prefer the model's email, else the best one we scraped from the site.
  const email = (parsed.email || "").trim() || foundEmails[0] || "";

  await sql`UPDATE outreach_leads SET
    business = ${noDash(parsed.business || lead.business || "")},
    email = ${email},
    phone = ${phone},
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
