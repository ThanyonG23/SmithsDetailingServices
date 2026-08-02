"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, sessionCookieValue, OPS_COOKIE } from "@/lib/ops/auth";
import {
  upsertDailyLog,
  replaceBookings,
  recordBookingsSeen,
  replaceAds,
  saveJobHours as saveJobHoursDb,
  setFollowupStatus,
  addStockItem,
  updateStock,
  deleteStockItem,
  clearStock,
  setOrdered,
  getStock,
  type StockItem,
} from "@/lib/ops/db";
import { OPS_STAFF, hoursBetween, cairnsToday } from "@/lib/ops/config";
import { parseBookingsIcs } from "@/lib/ops/calendar";
import { parseAdsCsv } from "@/lib/ops/ads";

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
    quotes: toNum(formData.get("quotes")),
    redos: toNum(formData.get("redos")),
    messages: toNum(formData.get("messages")),
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
  await recordBookingsSeen(bookings, cairnsToday());

  revalidatePath("/ops");
  redirect(`/ops?calok=${bookings.length}`);
}

/* Upload the Meta ads CSV → parse per-ad stats → replace the snapshot. */
export async function uploadAds(formData: FormData): Promise<void> {
  const file = formData.get("ads") as File | null;
  if (!file || file.size === 0) redirect("/ops?aderr=nofile");

  const text = Buffer.from(await file.arrayBuffer()).toString("utf8");
  const rows = parseAdsCsv(text);
  if (!rows.length) redirect("/ops?aderr=noads");
  await replaceAds(rows);

  revalidatePath("/ops");
  redirect(`/ops?adok=${rows.length}`);
}

/* Save the hours each car took today, keyed to the calendar UID. */
export async function logJobHours(formData: FormData): Promise<void> {
  const entries: { uid: string; hours: number }[] = [];
  for (const [key, val] of formData.entries()) {
    if (key.startsWith("jh::")) {
      const h = Number(val);
      entries.push({ uid: key.slice(4), hours: Number.isFinite(h) && h > 0 ? h : 0 });
    }
  }
  await saveJobHoursDb(entries);
  revalidatePath("/ops");
  redirect("/ops?jobsok=1");
}

/* Record a customer check-in outcome: happy (done), unhappy (needs rectify),
   or rectified (rectify job sorted). Auto-feeds the happy/unhappy tally. */
export async function setCheckin(formData: FormData): Promise<void> {
  const uid = String(formData.get("uid") || "");
  const outcome = String(formData.get("outcome") || "");
  if (uid && ["happy", "unhappy", "rectified"].includes(outcome)) {
    await setFollowupStatus(uid, outcome);
  }
  revalidatePath("/ops");
  redirect("/ops?fuok=1");
}

/* ---- stocktake ---------------------------------------------------- */

export async function addStock(formData: FormData): Promise<void> {
  const s = (k: string) => String(formData.get(k) || "").trim().slice(0, 300);
  const n = (k: string) => {
    const v = Number(formData.get(k));
    return Number.isFinite(v) && v >= 0 ? v : 0;
  };
  const item = s("item");
  if (!item) redirect("/ops/stock?stockerr=1");
  await addStockItem({
    category: s("category") || "Other",
    item,
    brand: s("brand"),
    website: s("website"),
    unit: s("unit"),
    min_qty: n("min_qty"),
    current_qty: n("current_qty"),
    notes: s("notes"),
  });
  revalidatePath("/ops/stock");
  redirect("/ops/stock?stockok=added");
}

export async function saveStock(formData: FormData): Promise<void> {
  const ids: number[] = [];
  for (const [key] of formData.entries()) {
    if (key.startsWith("cur::")) ids.push(Number(key.slice(5)));
  }
  const entries = ids
    .filter((id) => Number.isFinite(id) && id > 0)
    .map((id) => ({
      id,
      current_qty: Number(formData.get(`cur::${id}`)) || 0,
      min_qty: Number(formData.get(`min::${id}`)) || 0,
      website: String(formData.get(`web::${id}`) || "").slice(0, 300),
      notes: String(formData.get(`note::${id}`) || "").slice(0, 500),
    }));
  await updateStock(entries);
  revalidatePath("/ops/stock");
  redirect("/ops/stock?stockok=saved");
}

export async function deleteStock(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (Number.isFinite(id) && id > 0) await deleteStockItem(id);
  revalidatePath("/ops/stock");
  redirect("/ops/stock?stockok=deleted");
}

/* Tick a low item off the order list (or un-tick it). */
export async function markOrdered(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (Number.isFinite(id) && id > 0) await setOrdered(id, true);
  revalidatePath("/ops/stock");
  revalidatePath("/ops");
  redirect("/ops/stock?stockok=ordered");
}

export async function unmarkOrdered(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (Number.isFinite(id) && id > 0) await setOrdered(id, false);
  revalidatePath("/ops/stock");
  revalidatePath("/ops");
  redirect("/ops/stock?stockok=saved");
}

/* Smiths master stock list — tidied from the real supplier sheet.
   Tuple: [category, item, brand, website, unit, keep-on-hand (min), have (current), notes?] */
const NC = "https://northernchemicals.com.au/";
const GT = "https://gtechniq.com.au/";
const WAXIT = "https://www.waxit.com.au/";
const ECON = "https://economypaints.com.au/";

const STARTER_STOCK: Omit<StockItem, "id" | "updated_at" | "ordered">[] = (
  [
    // ── Chemicals ──
    ["Chemicals", "Mountain Air", "Northern Chemicals", NC, "L", 60, 30],
    ["Chemicals", "Truck Wash", "Northern Chemicals", NC, "L", 60, 0],
    ["Chemicals", "Reco Sheen", "Economy Paint Supplies", ECON, "L", 20, 6],
    ["Chemicals", "Iron Remover (Wheel & Paint Cleaner)", "Gtechniq", GT, "L", 2, 10],
    ["Chemicals", "Bug Remover", "Gtechniq", GT, "L", 5, 3],
    ["Chemicals", "Tar & Glue Remover", "Gtechniq", GT, "L", 1, 0.5],
    ["Chemicals", "Koch Chemie Metal Polish", "Koch Chemie (Waxit)", WAXIT, "ml", 75, 30],
    ["Chemicals", "Koch Chemie M302 Micro Cut", "Koch Chemie (Waxit)", WAXIT, "L", 3, 1],
    ["Chemicals", "Koch Chemie M902 Heavy Cut", "Koch Chemie (Waxit)", WAXIT, "L", 3, 1],
    ["Chemicals", "Ceramic Spray Sealant", "Gtechniq", GT, "L", 3, 0],
    ["Chemicals", "Bowdens Tyre Sheen", "Supercheap Auto", "", "ml", 500, 500],
    // ── Coatings ──
    ["Coatings", "Glass Coating Kit", "Gtechniq", GT, "kit", 5, 3],
    ["Coatings", "Wheel Armour", "Gtechniq", GT, "ea", 5, 3],
    // ── Consumables ──
    ["Consumables", "Sandpaper 800 grit (Revcut Blue 75mm)", "Revcut", "", "box", 1, 1],
    ["Consumables", "Sandpaper 1200 grit (Revcut Blue 75mm)", "Revcut", "", "box", 1, 1],
    ["Consumables", "Sandpaper 1500 grit (Revcut Blue 75mm)", "Revcut", "", "box", 1, 1],
    ["Consumables", "Sandpaper 2000 grit (Revcut Blue 75mm)", "Revcut", "", "box", 1, 1],
    ["Consumables", "Polishing Pads", "", "", "ea", 0, 0, "Add supplier & set levels"],
    ["Consumables", "Wool Pads", "", "", "ea", 0, 0, "Add supplier & set levels"],
    ["Consumables", "Suede Applicators", "Gtechniq", GT, "ea", 10, 10],
  ] as [string, string, string, string, string, number, number, string?][]
).map(([category, item, brand, website, unit, min_qty, current_qty, notes]) => ({
  category,
  item,
  brand,
  website,
  unit,
  min_qty,
  current_qty,
  notes: notes ?? "",
}));

/* One-time: load the master stock list (only if the table is empty). */
export async function seedStock(): Promise<void> {
  const existing = await getStock();
  if (existing.length === 0) {
    for (const it of STARTER_STOCK) await addStockItem(it);
  }
  revalidatePath("/ops/stock");
  redirect("/ops/stock?stockok=seeded");
}

/* Replace the whole table with the master list (wipes current counts). */
export async function reseedStock(): Promise<void> {
  await clearStock();
  for (const it of STARTER_STOCK) await addStockItem(it);
  revalidatePath("/ops/stock");
  redirect("/ops/stock?stockok=seeded");
}
