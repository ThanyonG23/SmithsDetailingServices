import nodemailer from "nodemailer";
import { ImapFlow } from "imapflow";

/* Gmail send (SMTP) + reply detection (IMAP) for the outreach auto-sender.
   Uses a Gmail App Password (needs 2-step verification on the account, and IMAP
   enabled in Gmail settings). Creds live only in Vercel env, never in code. */

const USER = process.env.GMAIL_USER || "";
const PASS = process.env.GMAIL_APP_PASSWORD || "";
const FROM_NAME = process.env.GMAIL_FROM_NAME || "Thanyon, Smiths Detailing";

export function mailerConfigured(): boolean {
  return !!USER && !!PASS;
}

// Send one plain-text email from the owner's Gmail. Plain text (no HTML/images)
// is deliberately chosen, it inboxes far better for cold outreach.
export async function sendMail(to: string, subject: string, text: string): Promise<{ ok: boolean; error?: string }> {
  if (!mailerConfigured()) return { ok: false, error: "GMAIL_USER / GMAIL_APP_PASSWORD not set in Vercel" };
  try {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: USER, pass: PASS },
    });
    await transport.sendMail({ from: `"${FROM_NAME}" <${USER}>`, to, subject, text });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "send failed" };
  }
}

// Has this address emailed us since we first contacted them? Used to stop the
// follow-up sequence the moment someone replies. Returns false if IMAP can't be
// reached (so a connection blip never silently kills the sequence, but note we
// then can't guarantee reply-suppression, hence IMAP should stay enabled).
export async function hasReplied(fromEmail: string, since: Date): Promise<boolean> {
  if (!mailerConfigured() || !fromEmail) return false;
  let client: ImapFlow | null = null;
  try {
    client = new ImapFlow({
      host: "imap.gmail.com",
      port: 993,
      secure: true,
      auth: { user: USER, pass: PASS },
      logger: false,
    });
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      const found = await client.search({ from: fromEmail, since });
      return Array.isArray(found) && found.length > 0;
    } finally {
      lock.release();
    }
  } catch {
    return false;
  } finally {
    try {
      if (client) await client.logout();
    } catch {
      /* ignore */
    }
  }
}
