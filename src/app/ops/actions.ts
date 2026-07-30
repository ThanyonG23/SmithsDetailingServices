"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, sessionCookieValue, OPS_COOKIE } from "@/lib/ops/auth";
import { upsertDailyLog, replaceBookings } from "@/lib/ops/db";
import { OPS_STAFF, hoursBetween } from "@/lib/ops/config";
import { parseBookingsIcs } from "@/lib/ops/calendar";

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
    jobs_completed: toNum(formData.get("jobs_completed")),
    revenue_collected: toNum(formData.get("revenue_collected")),
    completed_revenue: toNum(formData.get("completed_revenue")),
    ad_spend: toNum(formData.get("ad_spend")),
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

/* Upload the Google Calendar export (.zip or .ics) → parse bookings →
   replace the snapshot. Handles the zip Google gives you (all calendars)
   by pulling out the "Smiths Bookings" .ics. */
export async function uploadCalendar(formData: FormData): Promise<void> {
  const file = formData.get("cal") as File | null;
  if (!file || file.size === 0) redirect("/ops?calerr=nofile");

  const buf = Buffer.from(await file.arrayBuffer());
  let ics = "";

  if (file.name.toLowerCase().endsWith(".zip")) {
    const AdmZip = (await import("adm-zip")).default;
    const zip = new AdmZip(buf);
    const entries = zip.getEntries();
    const entry =
      entries.find(
        (e) => /smiths bookings/i.test(e.entryName) && e.entryName.toLowerCase().endsWith(".ics")
      ) || entries.find((e) => e.entryName.toLowerCase().endsWith(".ics"));
    if (!entry) redirect("/ops?calerr=noics");
    ics = entry!.getData().toString("utf8");
  } else {
    ics = buf.toString("utf8");
  }

  const bookings = parseBookingsIcs(ics).filter((b) => b.value > 0);
  await replaceBookings(bookings);

  revalidatePath("/ops");
  redirect(`/ops?calok=${bookings.length}`);
}
