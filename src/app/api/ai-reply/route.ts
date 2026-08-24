import { NextResponse } from "next/server";
import { isOwner } from "@/lib/ops/auth";
import { buildSystemPrompt } from "@/lib/ops/ai-prompt";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// The in-app helper calls this same-origin with the owner cookie. The browser
// extension (running on Meta's site) calls it cross-origin with a shared token,
// so we allow CORS and answer the preflight.
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, x-ext-token",
  "Access-Control-Max-Age": "86400",
};
const res = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: CORS });

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/* Drafts a lead follow-up from a pasted conversation thread. Authorised either by
   the owner login (in-app helper) or the extension token (Chrome extension), so the
   API key can't be abused. Uses the fast/cheap Claude model, a few $0.001 each. */
export async function POST(req: Request) {
  const envToken = process.env.AI_REPLY_EXT_TOKEN || "";
  const viaToken = !!envToken && (req.headers.get("x-ext-token") || "") === envToken;
  if (!viaToken && !isOwner()) {
    return res({ error: "Not authorised." }, 401);
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res(
      { error: "AI isn't set up yet, add ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables, then redeploy." },
      503
    );
  }

  let thread = "";
  let note = "";
  try {
    const body = await req.json();
    thread = body?.thread;
    note = body?.note;
  } catch {
    /* ignore */
  }
  thread = String(thread || "").slice(0, 8000);
  note = String(note || "").slice(0, 500).trim();
  if (!thread.trim()) {
    return res({ error: "Paste a message thread first." }, 400);
  }

  let userContent = `Here is the whole conversation with a lead (newest at the bottom, with timestamps where available). Read it carefully, work out where they are and why they haven't booked, then write the single best follow-up to send now.\n\n${thread}`;
  if (note) {
    // A steering note the team typed for THIS reply (e.g. "downsell to a cheaper
    // package"). It overrides your own read, do what it says, in the Smiths voice.
    userContent += `\n\n---\nINSTRUCTION FROM THE SMITHS TEAM for this specific reply. Follow it exactly, while keeping the Smiths voice and all the rules: ${note}`;
  }

  // Call one model. Returns the raw text (+ whether it was cut off), or an error.
  const call = async (model: string): Promise<{ raw?: string; err?: string; truncated?: boolean }> => {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          // Generous ceiling so a reply (which is short) can never be cut off
          // mid-sentence, even if the model spends tokens reasoning first.
          model,
          max_tokens: 1500,
          // Cache the big static instruction block (voice + prices + examples) so
          // back-to-back drafts reuse it instead of paying for it every time,          // ~90% cheaper input on it when working a queue, and a little faster.
          system: [
            { type: "text", text: buildSystemPrompt(), cache_control: { type: "ephemeral" } },
          ],
          messages: [{ role: "user", content: userContent }],
        }),
      });
      if (!r.ok) return { err: `${model}: ${(await r.text()).slice(0, 200)}` };
      const data = await r.json();
      // Grab the first TEXT block (robust to thinking/other block types).
      const blocks = (data?.content || []) as { type?: string; text?: string }[];
      const raw = (blocks.find((b) => b?.type === "text")?.text || blocks[0]?.text || "").trim();
      // stop_reason "max_tokens" means the model was cut off before it finished.
      const truncated = data?.stop_reason === "max_tokens";
      return raw ? { raw, truncated } : { err: `${model}: empty response` };
    } catch (e) {
      return { err: `${model}: ${e instanceof Error ? e.message : "request failed"}` };
    }
  };

  // Try the smart model. If it errored OR came back cut off, try the fast one and
  // prefer whichever gave a complete answer, so a half-message never reaches you.
  let out = await call("claude-sonnet-5");
  if (!out.raw || out.truncated) {
    const alt = await call("claude-haiku-4-5-20251001");
    if (alt.raw && !alt.truncated) out = alt;
    else if (!out.raw && alt.raw) out = alt;
  }
  if (!out.raw) {
    return res({ error: "AI error, " + (out.err || "no reply") }, 502);
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
  // Kill any em/en dashes, the #1 "a bot wrote this" tell.
  reply = reply.replace(/\s*[-–]\s*/g, ", ").replace(/,\s*,/g, ",").trim();
  // Safety net: a literal "[Name]" / "[Car]" slot must never reach a customer. Drop the
  // name slot, turn the car slot into "your car", then tidy leftover spacing/punctuation.
  reply = reply
    .replace(/\[(?:the\s*)?(?:first\s*name|name|customer)\]/gi, "")
    .replace(/\[(?:the\s*)?(?:car|vehicle|make(?:\s*(?:and|&)?\s*model)?)\]/gi, "your car")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +([,.!?])/g, "$1")
    .trim();
  if (!reply) {
    return res({ error: "AI didn't return a message, try again." }, 502);
  }
  return res({ reply, read });
}
