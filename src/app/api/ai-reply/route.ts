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

  const userContent = `Here is the whole conversation with a lead (newest at the bottom, with timestamps where available). Read it carefully, work out where they are and why they haven't booked, then write the single best follow-up to send now.\n\n${thread}`;

  // Call one model. Returns the raw text, or an error string if it failed.
  const call = async (model: string): Promise<{ raw?: string; err?: string }> => {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 800,
          system: buildSystemPrompt(),
          messages: [{ role: "user", content: userContent }],
        }),
      });
      if (!r.ok) return { err: `${model}: ${(await r.text()).slice(0, 200)}` };
      const data = await r.json();
      // Grab the first TEXT block (robust to thinking/other block types).
      const blocks = (data?.content || []) as { type?: string; text?: string }[];
      const raw = (blocks.find((b) => b?.type === "text")?.text || blocks[0]?.text || "").trim();
      return raw ? { raw } : { err: `${model}: empty response` };
    } catch (e) {
      return { err: `${model}: ${e instanceof Error ? e.message : "request failed"}` };
    }
  };

  // Try the smart model; if it errors for ANY reason, fall back to the fast one
  // so the helper always returns a reply.
  let out = await call("claude-sonnet-5");
  if (!out.raw) out = await call("claude-haiku-4-5-20251001");
  if (!out.raw) {
    return NextResponse.json({ error: "AI error — " + (out.err || "no reply") }, { status: 502 });
  }

  // The model writes the MESSAGE first, then "WHY: …". Split on WHY so the
  // reply always survives even if the read line is missing or malformed.
  const raw = out.raw;
  let read = "";
  let reply = raw;
  const w = raw.search(/(^|\n)\s*WHY\s*:/i);
  if (w >= 0) {
    reply = raw.slice(0, w).trim();
    read = raw.slice(w).replace(/^[\s\S]*?WHY\s*:\s*/i, "").trim();
  }
  // Defensive cleanup so a label can never leak into the customer-facing text:
  // handle the old "READ: … REPLY: …" shape and strip any stray leading labels.
  const rIdx = reply.search(/(^|\n)\s*REPLY\s*:/i);
  if (rIdx >= 0) {
    if (!read) {
      const rd = reply.slice(0, rIdx).match(/READ\s*:\s*([\s\S]*?)\s*$/i);
      read = rd ? rd[1].trim() : "";
    }
    reply = reply.slice(reply.indexOf(":", reply.search(/REPLY\s*:/i)) + 1).trim();
  }
  reply = reply
    .replace(/^\s*READ\s*:[^\n]*\n+/i, "") // drop a leaked "READ: …" first line
    .replace(/^\s*(reply|message)\s*:\s*/i, "") // drop a stray leading label
    .trim();
  // Kill any em/en dashes — the #1 "a bot wrote this" tell.
  reply = reply.replace(/\s*[—–]\s*/g, ", ").replace(/,\s*,/g, ",").trim();
  if (!reply) {
    return NextResponse.json({ error: "AI didn't return a message, try again." }, { status: 502 });
  }
  return NextResponse.json({ reply, read });
}
