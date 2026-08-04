import { NextResponse } from "next/server";
import { isOwner } from "@/lib/ops/auth";
import { buildSystemPrompt } from "@/lib/ops/ai-prompt";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/* Drafts a lead follow-up from a pasted conversation thread. Owner-only so the
   API key can't be abused. Uses the fast/cheap Claude model — a few $0.001 each. */
export async function POST(req: Request) {
  if (!isOwner()) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "AI isn't set up yet — add ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables, then redeploy." },
      { status: 503 }
    );
  }

  let thread = "";
  try {
    ({ thread } = await req.json());
  } catch {
    /* ignore */
  }
  thread = String(thread || "").slice(0, 8000);
  if (!thread.trim()) {
    return NextResponse.json({ error: "Paste a message thread first." }, { status: 400 });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 600,
        system: buildSystemPrompt(),
        messages: [
          {
            role: "user",
            content: `Here is the whole conversation with a lead (newest at the bottom, with timestamps where available). Read it carefully, work out where they are and why they haven't booked, then write the single best follow-up to send now.\n\n${thread}`,
          },
        ],
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      return NextResponse.json({ error: "AI error: " + t.slice(0, 300) }, { status: 502 });
    }
    const data = await r.json();
    const raw = (data?.content?.[0]?.text || "").trim();
    if (!raw) return NextResponse.json({ error: "AI returned nothing — try again." }, { status: 502 });

    // Split the model's "READ: … REPLY: …" output into the two parts.
    let read = "";
    let reply = raw;
    const m = raw.search(/(^|\n)\s*REPLY\s*:/i);
    if (m >= 0) {
      const cut = raw.indexOf(":", raw.search(/REPLY\s*:/i));
      reply = raw.slice(cut + 1).trim();
      const readMatch = raw.slice(0, m).match(/READ\s*:\s*([\s\S]*?)\s*$/i);
      read = readMatch ? readMatch[1].trim() : "";
    }
    return NextResponse.json({ reply, read });
  } catch {
    return NextResponse.json({ error: "Couldn't reach the AI — try again in a moment." }, { status: 502 });
  }
}
