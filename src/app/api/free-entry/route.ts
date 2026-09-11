import { NextResponse } from "next/server";
import { sql } from "@/lib/ops/db";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[a-z]{2,}(?:\.[a-z]{2,})?$/i;

let ensured: Promise<void> | null = null;
function ensure(): Promise<void> {
  if (!ensured) {
    ensured = sql`
      CREATE TABLE IF NOT EXISTS free_entries (
        id bigserial PRIMARY KEY,
        name text DEFAULT '',
        email text DEFAULT '',
        phone text DEFAULT '',
        created_at timestamptz DEFAULT now()
      )`
      .then(() => {})
      .catch((e) => {
        ensured = null;
        throw e;
      });
  }
  return ensured;
}

/* Records a free (no purchase necessary) entry into the members' draw. */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name || "").trim().slice(0, 100);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 200);
  const phone = String(body.phone || "").replace(/[^\d+ ]/g, "").trim().slice(0, 20);

  if (!name) return NextResponse.json({ error: "Please add your name." }, { status: 400 });
  if (!email && !phone) return NextResponse.json({ error: "Add an email or mobile." }, { status: 400 });
  if (email && !EMAIL_RE.test(email)) return NextResponse.json({ error: "That email doesn't look right." }, { status: 400 });

  try {
    await ensure();
    await sql`INSERT INTO free_entries (name, email, phone) VALUES (${name}, ${email}, ${phone})`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Couldn't save that, try again." }, { status: 502 });
  }
}
