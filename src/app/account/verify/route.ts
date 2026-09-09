import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { consumeLoginToken } from "@/lib/members/db";
import { MEMBER_COOKIE, memberCookieValue } from "@/lib/members/session";

export const dynamic = "force-dynamic";

/* Magic-link landing: consume the token, set the member session cookie, and
   send them to the portal. Invalid/expired tokens bounce back to sign-in. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const base = url.origin;

  let email: string | null = null;
  try {
    email = token ? await consumeLoginToken(token) : null;
  } catch {
    email = null;
  }

  if (!email) {
    return NextResponse.redirect(`${base}/account?e=link`, { status: 303 });
  }

  cookies().set(MEMBER_COOKIE, memberCookieValue(email), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return NextResponse.redirect(`${base}/account`, { status: 303 });
}
