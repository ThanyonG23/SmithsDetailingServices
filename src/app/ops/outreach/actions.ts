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
  campaign: string; // partner | affiliate
  // Auto-send pipeline
  approved: boolean;
  stage: number; // 0 not sent, 1 initial sent, 2 follow-up 1 sent, 3 final sent (done)
  replied: boolean;
  stopped: boolean;
  bounced: boolean;
  send_error: string;
  next_action_at: string | null;
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
  // Migrate: auto-send pipeline.
  await sql`ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT false`;
  await sql`ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS stage int NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS sent_at timestamptz`;
  await sql`ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS last_sent_at timestamptz`;
  await sql`ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS next_action_at timestamptz`;
  await sql`ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS replied boolean NOT NULL DEFAULT false`;
  await sql`ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS stopped boolean NOT NULL DEFAULT false`;
  await sql`ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS bounced boolean NOT NULL DEFAULT false`;
  await sql`ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS send_error text NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS campaign text NOT NULL DEFAULT 'partner'`;
  ready = true;
}

// Exported so the cron route can guarantee the columns exist before it runs.
export async function ensureOutreach() {
  await ensure();
}

export async function getOutreach(): Promise<Lead[]> {
  requireOwner();
  await ensure();
  const rows = (await sql`
    SELECT id, url, business, category, address, rating, email, phone, channel,
           personalisation, prize, subject, body, sms, status, error, campaign,
           approved, stage, replied, stopped, bounced, send_error, next_action_at
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

export async function addListings(text: string, campaign: string = "partner"): Promise<Lead[]> {
  requireOwner();
  await ensure();
  const camp = campaign === "affiliate" ? "affiliate" : "partner";
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
    await sql`INSERT INTO outreach_leads (url, business, category, address, phone, rating, status, campaign)
      VALUES (${p.url}, ${p.business}, ${p.category}, ${p.address}, ${p.phone}, ${p.rating}, 'new', ${camp})`;
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
    // System / boilerplate / CDN addresses that are never a real contact.
    if (/(w3\.org|schema\.org|schemaorg|sentry|wix|example\.|yourdomain|domain\.com|your-?email|email\.com|@2x|googleapis|gstatic|cloudflare|jsdelivr|cloudfront|\.wixpress|@sentry|latin@|core-js|@babel)/i.test(e)) continue;
    found.add(e);
  }
  return [...found].sort((a, b) => (Number(b.endsWith(domain)) - Number(a.endsWith(domain)))).slice(0, 5);
}

// Outbound website links from a page (e.g. a Linktree), excluding socials and
// asset/CDN hosts, so we can follow an influencer through to their real site.
const SOCIAL_HOSTS = /(linktr\.ee|instagram|tiktok|facebook|fb\.com|youtu|twitter|x\.com|threads|snapchat|spotify|apple|amazon|linkedin|pinterest|whatsapp|t\.me|telegram|cdn|cloudfront|googleapis|gstatic|fonts|sentry|licdn|shopify\.com\/cdn)/i;
function extractOutboundLinks(html: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(/https?:\/\/[a-z0-9.-]+\.[a-z]{2,}[^\s"'\\<>]*/gi)) {
    const u = m[0];
    let host = "";
    try {
      host = new URL(u).hostname;
    } catch {
      continue;
    }
    if (SOCIAL_HOSTS.test(host)) continue;
    const clean = u.split("?")[0].replace(/[)\].,]+$/, "");
    if (seen.has(host)) continue;
    seen.add(host);
    out.push(clean);
  }
  return out;
}

// Fetch a site's text + any emails. Follows a Linktree to a linked website, and
// if the homepage has no email, tries the common contact pages (bounded).
async function fetchSite(url: string, follow: boolean = true): Promise<{ text: string; emails: string[] }> {
  let domain = "";
  try {
    domain = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    /* ignore */
  }
  const homeHtml = await getHtml(url);
  let text = htmlToText(homeHtml);
  let emails = extractEmails(homeHtml, domain);

  // `follow` is off for affiliate/influencer targets: a Linktree's links are the
  // BRANDS they promote, so following them grabs the wrong email. Those are a DM
  // channel anyway. We still read the page text for personalisation.
  if (follow && emails.length === 0 && /linktr\.ee|link-in-bio|beacons\.ai|linkin\.bio/i.test(url)) {
    for (const l of extractOutboundLinks(homeHtml).slice(0, 3)) {
      try {
        const h = await getHtml(l);
        const em = extractEmails(h, (() => { try { return new URL(l).hostname.replace(/^www\./, ""); } catch { return ""; } })());
        if (em.length) {
          emails = em;
          if (!text) text = htmlToText(h);
          break;
        }
      } catch {
        /* ignore */
      }
    }
  }

  if (follow && emails.length === 0) {
    for (const path of ["/contact", "/contact-us", "/contact-us/", "/contact/", "/contact.html", "/get-a-quote", "/about", "/about-us"]) {
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
- If you find an owner or contact first name, use it in the greeting; otherwise write "Hey Mate,". Never output the literal text [First name].
- NEVER use em dashes or en dashes anywhere. Use commas.
- Australian spelling, warm, direct, human tone.
- Only reference details that are actually provided. Never invent results, awards, reviews or facts.
- Keep the body close to the template length.
- SMS version: one short paragraph, no subject line, same offer, end with the link and "keen for a quick chat?".

Output STRICT JSON only, no markdown fences, with exactly these keys: business, email, phone, channel, personalisation, prize, subject, body, sms.`;

const AFFILIATE_SYSTEM_PROMPT = `You write cold outreach for Thanyon from Smiths Detailing Services in Cairns, Australia, recruiting AFFILIATES for the Smiths partner program.

The offer: Smiths runs a giveaway (win $1,000 for a $1 entry). Affiliates earn 25% of everything their referred members pay, recurring, for as long as the member stays. Free to join, they just share a link. Their audience gets double entries for using their link. They sign up and get their link at smithsdetailingservices.com.au/earn.

The target is a person with an audience (an influencer, content creator, community page, or someone who promotes things). You are given details about them (name/handle, category, area, and if available the text of their website or profile). Use whatever is provided.

Do two things:
1. Extract, using ONLY what is provided (never invent): their name or handle; contact email (or "" if none); phone (or ""); the best channel to reach them (email, phone, socials, form, none); and ONE genuine personalisation detail about their audience or content.
2. Write the recruitment email (subject + body) and a short SMS version.

Use this template closely, swapping in a genuine personalised line one:

Subject: Are you good at being an affiliate?

Hey [First name], Thanyon here from Smiths.

[ONE personalised line about their audience or content, then tie it in, e.g. "You clearly know how to work an audience, so this is right up your alley."]

We run a giveaway here in Cairns, win $1,000 for a $1 entry, and we pay 25% of every member you send us, every month, for as long as they stay. Free to join, you just drop a link in your bio or posts.

"Win $1k for $1" sells itself, and your audience gets double entries through your link, so it actually converts.

Grab your link here, takes 60 seconds: smithsdetailingservices.com.au/earn

Need more information?

Thanyon
Smiths Detailing Services

RULES:
- If you find their first name, use it; otherwise write "Hey Mate,". Never output the literal text [First name].
- NEVER use em dashes or en dashes. Use commas.
- Australian spelling, warm, direct, human tone. Keep it short.
- Only reference details actually provided. Never invent facts, follower counts or results.
- The "sms" field is an INSTAGRAM DM, not an email. Write it casual and short: 2 to 4 short sentences, no subject line, no formal signoff. Open with a quick personalised line, then the hook (get paid 25% every month for sharing our $1-to-win-$1,000 Cairns giveaway, free to join, their audience gets double entries through their link), then the link smithsdetailingservices.com.au/earn, then a casual "keen?". Use one or two emojis, Australian, friendly, human. Sign off casually like "- Thanyon, Smiths". No em dashes.

Output STRICT JSON only, no markdown fences, with exactly these keys: business, email, phone, channel, personalisation, prize, subject, body, sms. Set prize to "".`;

async function callClaude(model: string, key: string, context: string, system: string): Promise<string | null> {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model,
        max_tokens: 1600,
        system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
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
// No name found? Any leftover "[First name]" slot becomes "Mate".
const fixName = (s: string) => noDash(s).replace(/\[\s*first\s*name\s*\]/gi, "Mate");

export async function scanLead(id: number): Promise<Lead[]> {
  requireOwner();
  await ensure();
  const key = process.env.ANTHROPIC_API_KEY;
  const rows = (await sql`
    SELECT url, business, category, address, rating, phone, campaign FROM outreach_leads WHERE id = ${id}
  `) as unknown as { url: string; business: string; category: string; address: string; rating: string; phone: string; campaign: string }[];
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
      const site = await fetchSite(lead.url, lead.campaign !== "affiliate");
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

  const systemPrompt = lead.campaign === "affiliate" ? AFFILIATE_SYSTEM_PROMPT : SYSTEM_PROMPT;
  let raw = await callClaude("claude-sonnet-5", key, context, systemPrompt);
  if (!raw) raw = await callClaude("claude-haiku-4-5-20251001", key, context, systemPrompt);
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
    body = ${fixName(parsed.body || "")},
    sms = ${fixName(parsed.sms || "")},
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

// Approve a written lead into the auto-send queue (or pull it back out).
export async function approveLead(id: number, approved: boolean): Promise<Lead[]> {
  requireOwner();
  await ensure();
  await sql`UPDATE outreach_leads SET approved = ${approved}, stopped = false, updated_at = now() WHERE id = ${id}`;
  return getOutreach();
}

// Approve every written lead that has an email and hasn't been sent yet.
export async function approveAllReady(): Promise<Lead[]> {
  requireOwner();
  await ensure();
  await sql`UPDATE outreach_leads SET approved = true, stopped = false, updated_at = now()
    WHERE status = 'written' AND email <> '' AND stage = 0 AND NOT approved`;
  return getOutreach();
}

export async function stopLead(id: number): Promise<Lead[]> {
  requireOwner();
  await ensure();
  await sql`UPDATE outreach_leads SET stopped = true, approved = false, updated_at = now() WHERE id = ${id}`;
  return getOutreach();
}

export async function markReplied(id: number): Promise<Lead[]> {
  requireOwner();
  await ensure();
  await sql`UPDATE outreach_leads SET replied = true, updated_at = now() WHERE id = ${id}`;
  return getOutreach();
}

// Reset a lead's send pipeline back to the start (e.g. after fixing a bounce).
export async function resetSend(id: number): Promise<Lead[]> {
  requireOwner();
  await ensure();
  await sql`UPDATE outreach_leads SET stage = 0, sent_at = null, last_sent_at = null, next_action_at = null,
    replied = false, stopped = false, bounced = false, send_error = '', updated_at = now() WHERE id = ${id}`;
  return getOutreach();
}
