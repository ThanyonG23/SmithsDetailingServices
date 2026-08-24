import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";

/* =====================================================================
   DAILY OPS, auth (two roles)
   ---------------------------------------------------------------------
   Two passwords, two levels of access:
     • OPS_PASSWORD       → "owner": full ops (dashboard, numbers, CRM…)
     • OPS_CREW_PASSWORD  → "crew":  the Team board ONLY
   On success we set an httpOnly cookie whose value is an HMAC (signed
   with OPS_SECRET) that encodes the role. The raw password is never
   stored, and the cookie can't be forged without the secret.

   Set in Vercel:
     OPS_PASSWORD      , the owner/manager password (you, Thanyon)
     OPS_CREW_PASSWORD , the detailers' password (Team board only)
     OPS_SECRET        , any long random string (signs the cookie)
   ===================================================================== */

export const OPS_COOKIE = "ops_session";
export type Role = "owner" | "crew";

function signingSecret(): string {
  return (
    process.env.OPS_SECRET ||
    process.env.OPS_PASSWORD ||
    "insecure-dev-secret-please-set-OPS_SECRET"
  );
}

// Owner token unchanged from the single-password era, so existing owner
// sessions stay valid. Crew gets its own distinct token.
function tokenFor(role: Role): string {
  const tag = role === "crew" ? "smiths-crew-v1" : "smiths-ops-v1";
  return createHmac("sha256", signingSecret()).update(tag).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Which role (if any) an entered password grants. */
export function passwordRole(input: string): Role | null {
  const owner = process.env.OPS_PASSWORD || "";
  const crew = process.env.OPS_CREW_PASSWORD || "";
  if (owner && safeEqual(input, owner)) return "owner";
  if (crew && safeEqual(input, crew)) return "crew";
  return null;
}

/** The role of the current session, from the signed cookie. */
export function getRole(): Role | null {
  const value = cookies().get(OPS_COOKIE)?.value;
  if (!value) return null;
  if (safeEqual(value, tokenFor("owner"))) return "owner";
  if (safeEqual(value, tokenFor("crew"))) return "crew";
  return null;
}

export function isAuthed(): boolean {
  return getRole() !== null;
}

export function isOwner(): boolean {
  return getRole() === "owner";
}

/** The value to store in the session cookie once the password checks out. */
export function sessionCookieValue(role: Role): string {
  return tokenFor(role);
}

/** Guard for owner-only pages: crew is bounced to their Team board, everyone
    else to the login screen. Call at the top of a server page/route. */
export function requireOwner(): void {
  const role = getRole();
  if (!role) redirect("/ops/login");
  if (role !== "owner") redirect("/ops/team");
}

/** Guard for pages any signed-in role may see (the Team board). */
export function requireAuth(): void {
  if (!getRole()) redirect("/ops/login");
}
