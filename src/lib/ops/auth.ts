import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

/* =====================================================================
   DAILY OPS — auth (one shared password)
   ---------------------------------------------------------------------
   The login form checks the entered password against OPS_PASSWORD, and
   on success we set an httpOnly cookie whose value is an HMAC signed
   with OPS_SECRET. The raw password is never stored in the cookie, and
   the cookie can't be forged without the secret.

   Set BOTH env vars in Vercel:
     OPS_PASSWORD  — the password you and Ashlee type in
     OPS_SECRET    — any long random string (used to sign the cookie)
   ===================================================================== */

export const OPS_COOKIE = "ops_session";

function signingSecret(): string {
  return (
    process.env.OPS_SECRET ||
    process.env.OPS_PASSWORD ||
    "insecure-dev-secret-please-set-OPS_SECRET"
  );
}

function sessionToken(): string {
  return createHmac("sha256", signingSecret())
    .update("smiths-ops-v1")
    .digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.OPS_PASSWORD || "";
  if (!expected) return false;
  return safeEqual(input, expected);
}

export function isAuthed(): boolean {
  const value = cookies().get(OPS_COOKIE)?.value;
  if (!value) return false;
  return safeEqual(value, sessionToken());
}

/** The value to store in the session cookie once the password checks out. */
export function sessionCookieValue(): string {
  return sessionToken();
}
