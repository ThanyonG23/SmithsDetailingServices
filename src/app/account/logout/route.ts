import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MEMBER_COOKIE } from "@/lib/members/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  cookies().delete(MEMBER_COOKIE);
  return NextResponse.redirect(`${new URL(req.url).origin}/account`, { status: 303 });
}
