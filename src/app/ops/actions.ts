"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, sessionCookieValue, OPS_COOKIE } from "@/lib/ops/auth";
import { upsertDailyLog } from "@/lib/ops/db";
import { OPS_STAFF, hoursBetween } from "@/lib/ops/config";

export async function login(formData: FormData): Promise<void> {
  const password = String(formData.get("password") || "");
  if (!checkPassword(password)) redirect("/ops/login?error=1");

  cookies().set(OPS_COOKIE, sessionCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  redirect("/ops");
}

export async function logout(): Promise<void> {
  cookies().delete(OPS_COOKIE);
  redirect("/ops/login");
}

function toNum(v: FormDataEntryValue | null): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export async function saveEntry(formData: FormData): Promise<void> {
  const staff_hours: Record<string, number> = {};
  const staff_shifts: Record<string, { start: string; end: string }> = {};
  const staff_notes: Record<string, string> = {};

  for (const name of OPS_STAFF) {
    const start = String(formData.get(`start_${name}`) || "");
    const end = String(formData.get(`end_${name}`) || "");
    const note = String(formData.get(`notes_${name}`) || "").slice(0, 2000);

    if (start && end) {
      staff_shifts[name] = { start, end };
      const h = hoursBetween(start, end);
      if (h > 0) staff_hours[name] = h;
    }
    if (note.trim()) staff_notes[name] = note;
  }

  const log_date = String(formData.get("log_date") || "").slice(0, 10);

  await upsertDailyLog({
    log_date,
    bookings: toNum(formData.get("bookings")),
    jobs_completed: toNum(formData.get("jobs_completed")),
    revenue_collected: toNum(formData.get("revenue_collected")),
    happy_customers: toNum(formData.get("happy_customers")),
    unhappy_customers: toNum(formData.get("unhappy_customers")),
    staff_hours,
    staff_shifts,
    staff_notes,
    notes_today: String(formData.get("notes_today") || "").slice(0, 4000),
  });

  revalidatePath("/ops");
  redirect(`/ops?date=${encodeURIComponent(log_date)}&saved=1`);
}
