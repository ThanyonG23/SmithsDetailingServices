import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

/* Member session: an httpOnly cookie holding "email|hmac(email)". Signed with
   the same secret family as ops, so it can't be forged. Mirrors the ops auth
   approach but is a separate cookie and namespace. */

export const MEMBER_COOKIE = "smiths_member";

function secret(): string {
  return (
    process.env.MEMBER_SECRET ||
    process.env.OPS_SECRET ||
    process.env.OPS_PASSWORD ||
    "insecure-dev-secret-please-set-MEMBER_SECRET"
  );
}

function sign(email: string): string {
  return createHmac("sha256", secret()).update(`member:${email.toLowerCase().trim()}`).digest("hex");
}

/** Cookie value to store once a magic link checks out. */
export function memberCookieValue(email: string): string {
  return `${email.toLowerCase().trim()}|${sign(email)}`;
}

/** The signed-in member's email, or null. */
export function getSessionEmail(): string | null {
  const v = cookies().get(MEMBER_COOKIE)?.value;
  if (!v) return null;
  const idx = v.lastIndexOf("|");
  if (idx < 0) return null;
  const email = v.slice(0, idx);
  const sig = v.slice(idx + 1);
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(email));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return email;
}
