"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { passwordRole, sessionCookieValue, OPS_COOKIE } from "@/lib/ops/auth";
import {
  upsertDailyLog,
  replaceBookings,
  recordBookingsSeen,
  replaceAds,
  setJobDayHours,
  setJobFinished,
  setJobNote,
  clockStart,
  clockStop,
  setFollowupStatus,
  addStockItem,
  updateStock,
  deleteStockItem,
  clearStock,
  setOrdered,
  setMetaMessages,
  setChecklist,
  upsertCustomers,
  clearCustomers,
  upsertTemplate,
  deleteTemplate,
  replaceTemplates,
  getStock,
  type StockItem,
} from "@/lib/ops/db";
import { OPS_STAFF, hoursBetween, cairnsToday } from "@/lib/ops/config";
import { parseBookingsIcs, parseCustomersIcs } from "@/lib/ops/calendar";
import { parseAdsCsv, parseAdsDailyMessages } from "@/lib/ops/ads";

export async function login(formData: FormData): Promise<void> {
  const password = String(formData.get("password") || "");
  const role = passwordRole(password);
  if (!role) redirect("/ops/login?error=1");

  cookies().set(OPS_COOKIE, sessionCookieValue(role), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  // crew only get the Team board; owner lands on the full dashboard
  redirect(role === "crew" ? "/ops/team" : "/ops");
}

export async function logout(): Promise<void> {
  cookies().delete(OPS_COOKIE);
  redirect("/ops/login");
}

function toNum(v: FormDataEntryValue | null): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Read the whole day-log form into a record — shared by the explicit save
    and the as-you-go auto-save so they can never drift apart. */
function parseDayForm(formData: FormData) {
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

  return {
    log_date: String(formData.get("log_date") || "").slice(0, 10),
    jobs_completed: toNum(formData.get("jobs_completed")),
    revenue_collected: toNum(formData.get("revenue_collected")),
    completed_revenue: toNum(formData.get("completed_revenue")),
    ad_spend: toNum(formData.get("ad_spend")),
    quotes: toNum(formData.get("quotes")),
    redos: toNum(formData.get("redos")),
    messages: toNum(formData.get("messages")),
    staff_hours,
    staff_shifts,
    staff_notes,
    notes_today: String(formData.get("notes_today") || "").slice(0, 4000),
  };
}

export async function saveEntry(formData: FormData): Promise<void> {
  const entry = parseDayForm(formData);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.log_date)) redirect("/ops");
  await upsertDailyLog(entry);
  revalidatePath("/ops");
  redirect(`/ops?date=${encodeURIComponent(entry.log_date)}&saved=1`);
}

/** Auto-save the day's log as Ashlee fills it in — the SAME write as "Save the
    day" but with no redirect, so it fires quietly (debounced) on every change.
    revalidate keeps the router cache fresh so the numbers are still there when
    she switches tabs and comes back. */
export async function autoSaveDay(formData: FormData): Promise<void> {
  const entry = parseDayForm(formData);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.log_date)) return;
  await upsertDailyLog(entry);
  revalidatePath("/ops");
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

  // Build/refresh the CRM from the calendar — deduped by phone/email, so it
  // never doubles up across uploads. Sorted by date so latest details win.
  const custs = parseCustomersIcs(ics).sort((a, b) => a.date.localeCompare(b.date));
  const byKey = new Map<
    string,
    {
      key: string;
      name: string;
      phone: string;
      email: string;
      car: string;
      bookings: number;
      total_value: number;
      first_seen: string;
      last_seen: string;
    }
  >();
  for (const r of custs) {
    const e =
      byKey.get(r.key) ||
      {
        key: r.key,
        name: "",
        phone: "",
        email: "",
        car: "",
        bookings: 0,
        total_value: 0,
        first_seen: r.date,
        last_seen: r.date,
      };
    if (r.name) e.name = r.name;
    if (r.phone) e.phone = r.phone;
    if (r.email) e.email = r.email;
    if (r.car) e.car = r.car;
    e.bookings += 1;
    e.total_value += r.value;
    if (r.date < e.first_seen) e.first_seen = r.date;
    if (r.date > e.last_seen) e.last_seen = r.date;
    byKey.set(r.key, e);
  }
  // Rebuild the CRM fresh from the full calendar each upload — self-cleaning,
  // never doubles up, and clears out any old junk records.
  if (byKey.size) {
    await clearCustomers();
    await upsertCustomers([...byKey.values()]);
  }

  revalidatePath("/ops");
  redirect(`/ops?calok=${bookings.length}`);
}

/* Upload the Meta ads CSV → parse per-ad stats → replace the snapshot.
   If it's a single-day export, also auto-record that day's Meta leads. */
export async function uploadAds(formData: FormData): Promise<void> {
  const file = formData.get("ads") as File | null;
  if (!file || file.size === 0) redirect("/ops/ads?aderr=nofile");

  const text = Buffer.from(await file.arrayBuffer()).toString("utf8");
  const rows = parseAdsCsv(text);
  if (!rows.length) redirect("/ops/ads?aderr=noads");
  await replaceAds(rows);

  // Auto-record daily Meta leads. Works for a single-day export or a
  // Day-breakdown export (one row per ad per day → backfills every day).
  for (const d of parseAdsDailyMessages(text)) {
    await setMetaMessages(d.date, d.messages);
  }

  revalidatePath("/ops");
  revalidatePath("/ops/ads");
  redirect(`/ops/ads?adok=${rows.length}`);
}

/* Save the hours each car took TODAY, keyed to the calendar UID + today's
   date — so a job worked over several days accumulates a running total. */
export async function logJobHours(formData: FormData): Promise<void> {
  const today = cairnsToday();
  const entries: { uid: string; date: string; hours: number }[] = [];
  const onFloor: string[] = []; // every job shown (hidden job:: marker)
  const done = new Set<string>(); // the ones with "Done" ticked
  const notes: { uid: string; note: string }[] = [];
  for (const [key] of formData.entries()) {
    if (key.startsWith("jh::")) {
      const h = Number(formData.get(key));
      entries.push({ uid: key.slice(4), date: today, hours: Number.isFinite(h) && h > 0 ? h : 0 });
    } else if (key.startsWith("job::")) {
      onFloor.push(key.slice(5));
    } else if (key.startsWith("fin::")) {
      done.add(key.slice(5));
    } else if (key.startsWith("note::")) {
      notes.push({ uid: key.slice(6), note: String(formData.get(key) || "").slice(0, 1000) });
    }
  }
  await setJobDayHours(entries);
  // A job leaves the floor ONLY when its Done box is ticked; unticking puts it
  // back. Toggle every job on the floor so it reflects the boxes exactly.
  for (const uid of onFloor) await setJobFinished(uid, done.has(uid));
  for (const n of notes) await setJobNote(n.uid, n.note);
  revalidatePath("/ops");
  redirect("/ops?jobsok=1");
}

/* ---- detailer time-clock (team board) ----------------------------- */

/** Save a car's running note (from the team board). */
export async function saveJobNote(uid: string, note: string): Promise<void> {
  const u = String(uid || "").slice(0, 200);
  if (!u) return;
  await setJobNote(u, String(note || "").slice(0, 1000));
  revalidatePath("/ops/team");
  revalidatePath("/ops");
}

export async function clockOn(uid: string, detailer: string): Promise<void> {
  const u = String(uid || "").slice(0, 200);
  const d = String(detailer || "").slice(0, 40);
  if (!u || !d) return;
  await clockStart(u, d, cairnsToday());
  revalidatePath("/ops/team");
  revalidatePath("/ops");
}

export async function clockOff(uid: string, detailer: string): Promise<void> {
  const u = String(uid || "").slice(0, 200);
  const d = String(detailer || "").slice(0, 40);
  if (!u || !d) return;
  await clockStop(u, d, cairnsToday());
  revalidatePath("/ops/team");
  revalidatePath("/ops");
}

/* Record a customer check-in outcome: happy (done), unhappy (needs rectify),
   or rectified (rectify job sorted). Auto-feeds the happy/unhappy tally. */
export async function setCheckin(formData: FormData): Promise<void> {
  const uid = String(formData.get("uid") || "");
  const outcome = String(formData.get("outcome") || "");
  if (uid && ["happy", "unhappy", "rectified"].includes(outcome)) {
    await setFollowupStatus(uid, outcome);
    await setJobFinished(uid, true); // a check-in means the job's done — stop carry-over
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

/* Save Ashlee's daily run-sheet ticks (called from the client, no reload). */
export async function saveChecklist(date: string, keys: string[]): Promise<void> {
  const d = String(date || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return;
  const clean = (Array.isArray(keys) ? keys : []).map((k) => String(k).slice(0, 40)).slice(0, 60);
  await setChecklist(d, clean);
  revalidatePath("/ops"); // so the saved ticks show after reload/navigation
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

/* ---- templates (quote/package library) ----------------------------- */

/** Pull the size label out of a variant block (the 🔶 line, else first line). */
function variantLabel(block: string): string {
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
  const hex = lines.find((l) => l.includes("🔶"));
  return (hex ? hex.replace(/🔶/g, "").trim() : lines[0] || "").slice(0, 40);
}

export async function saveTemplate(formData: FormData): Promise<void> {
  const family = String(formData.get("title") || "").trim().slice(0, 100);
  const raw = String(formData.get("body") || "").replace(/\r\n/g, "\n");
  // Split a multi-variant paste on the big blank-line gaps (4+ newlines);
  // tidy each block's internal spacing.
  const blocks = raw
    .split(/\n[ \t]*(?:\n[ \t]*){3,}/)
    .map((b) => b.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+\n/g, "\n").trim())
    .filter((b) => b.length > 25);
  if (blocks.length === 0) redirect("/ops/templates");

  if (blocks.length === 1) {
    await upsertTemplate(null, family || variantLabel(blocks[0]) || "Template", blocks[0]);
  } else {
    // one copyable template per vehicle-size variant
    for (const b of blocks) {
      const size = variantLabel(b);
      const title = family ? (size ? `${family} — ${size}` : family) : size || "Template";
      await upsertTemplate(null, title.slice(0, 120), b);
    }
  }
  revalidatePath("/ops/templates");
  redirect("/ops/templates?tok=saved");
}

export async function removeTemplate(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (Number.isFinite(id) && id > 0) await deleteTemplate(id);
  revalidatePath("/ops/templates");
  redirect("/ops/templates?tok=deleted");
}

/* Smiths standard quote templates — clean, per vehicle size. */
const LOC = "📍 209 Bunda Street, Parramatta Park, Cairns QLD";
const GUARANTEE = "💯 If you're not happy: You don't pay.";
const BOOK = "Would you like to book this in?";

function correctionBody(interior: number, bonus: number, total: string): string {
  return `Hey! We can definitely take care of your vehicle with our Exterior Correction Package
Our Exterior Correction Package Also Includes:

✅ Contact Wash
✅ Decontamination Wash
✅ Clay Bar Treatment
✅ Multi Stage Paint Correction
✅ 3 Year Ceramic Coating

🎁 BONUS #1: FREE Premium Interior Detail (Valued At $${interior})
🎁 BONUS #2: LIMITED TIME FREE UPGRADES
✅ Engine Bay Detail
✅ Exterior Plastic Restore

Bonus Free Inclusions: $${bonus}
Total Price Today: $${total}
⏱️ 1-2 days turnaround
${LOC}

${GUARANTEE}
${BOOK}`;
}

function interiorBody(price: string): string {
  return `Hey! We can definitely take care of your vehicle with our Premium Interior Package

This Package Also Includes:
✅ Interior Vacuum
✅ Carpet Shampoo
✅ Carpet Extraction
✅ Interior Surfaces Cleaned
✅ Interior Plastic Rejuvenated
✅ Windows Streak Free

⏱️ 2-3 hours
💵 $${price}
${LOC}
${GUARANTEE}

${BOOK}`;
}

function premiumBody(price: string, hrs: string): string {
  return `Hey! We can definitely take care of your vehicle with our Premium Interior & Exterior Detail

This package also includes:
✅ Deep Interior Clean
✅ Carpet Shampoo & Extraction
✅ Plastic Rejuvenation
✅ Full Exterior Wash & Dry
✅ Tyre Shine
✅ Ceramic Spray Sealant

⏱️ Takes ${hrs}
💵 $${price}
${LOC}
${GUARANTEE}

${BOOK}`;
}

function cutPolishBody(price: string): string {
  return `Hey! We can definitely take care of your vehicle with our Premium Interior & Exterior Detail + Cut & Polish Package

This package also includes:
✅ Deep Interior Clean
✅ Carpet Shampoo & Extraction
✅ Plastic Rejuvenation
✅ Decontamination Wash
✅ Clay Bar Treatment
✅ 1 Step Cut
✅ 1 Step Polish
✅ Ceramic Spray Sealant

⏱️ 24 hour turnaround
💰 $${price}
${LOC}
${GUARANTEE}

${BOOK}`;
}

const askDetailsBody = `Great! I just need the following please:

Email:
Phone:

Thanks!`;

const confirmedBody = `Thank you, that's all booked in!

You should have received a Google Calendar invitation with the booking information and location.

I'll message the day before as a friendly reminder.

Any questions, feel free to reach out.

Have a great day and talk soon :)`;

const calendarBody = `Car:
Quote:
Phone:
Email:
Extras:
Referral:

📍 BOOKING CONFIRMATION

Thanks so much: Your booking is confirmed and locked in!

We'll also send you a friendly reminder the day before your booking.

A few quick things to note:

• Reschedule or cancel? Please give us more than 48 hours' notice — this really hurts our business if you don't.

• Extra dirty vehicles: if your car is extra dirty and takes longer than usual, our team will let you know before starting and there may be a surcharge.

• Pet hair: standing up you might not see much, but our team facedown vacuuming see everything. If your car has pet hair we charge a $55 pet hair fee (unless it's bad — we'll let you know beforehand).

• Seat covers: if you'd like your seats cleaned, please remove any seat covers beforehand — we won't remove them ourselves.

• Personal belongings: we'll safely remove and return anything left in the car, but it's faster and smoother if the vehicle is emptied beforehand.

• Timing (we aim to get your car back ASAP):
Standard: 3-4 hours
Premium: 4-5 hours
Premium + Polish: 1 day
Premium + Cut & Polish: 1-2 days
Correction + Coat: 1-2 days

Any questions at all, feel free to reach out. Thanks again — we look forward to seeing you!`;

const STANDARD_TEMPLATES: { title: string; body: string; sort: number }[] = [
  { title: "Booking — Ask for details", body: askDetailsBody, sort: 30 },
  { title: "Booking — Confirmed message", body: confirmedBody, sort: 31 },
  { title: "Booking — Calendar event (paste into GCal)", body: calendarBody, sort: 32 },
  { title: "Correction — Single Cab ($1,500)", body: correctionBody(230, 400, "1,500"), sort: 0 },
  { title: "Correction — Sedan/Dual Cab ($2,100)", body: correctionBody(280, 450, "2,100"), sort: 1 },
  { title: "Correction — SUV ($2,200)", body: correctionBody(330, 500, "2,200"), sort: 2 },
  { title: "Correction — 7 Seater ($2,300)", body: correctionBody(350, 535, "2,300"), sort: 3 },
  { title: "Interior Only — Single Cab ($250)", body: interiorBody("250"), sort: 5 },
  { title: "Interior Only — Sedan/Dual Cab ($300)", body: interiorBody("300"), sort: 6 },
  { title: "Interior Only — SUV ($330)", body: interiorBody("330"), sort: 7 },
  { title: "Interior Only — 7 Seater ($350)", body: interiorBody("350"), sort: 8 },
  { title: "Cut & Polish — Single Cab ($850)", body: cutPolishBody("850"), sort: 10 },
  { title: "Cut & Polish — Sedan/Dual Cab ($1,000)", body: cutPolishBody("1,000"), sort: 11 },
  { title: "Cut & Polish — SUV ($1,100)", body: cutPolishBody("1,100"), sort: 12 },
  { title: "Cut & Polish — 7 Seater ($1,200)", body: cutPolishBody("1,200"), sort: 13 },
  { title: "Premium Detail — Single Cab ($350)", body: premiumBody("350", "3-4 hrs"), sort: 20 },
  { title: "Premium Detail — Sedan/Dual Cab ($400)", body: premiumBody("400", "3-4 hrs"), sort: 21 },
  { title: "Premium Detail — SUV ($430)", body: premiumBody("430", "3-4 hrs"), sort: 22 },
  { title: "Premium Detail — 7 Seater ($450)", body: premiumBody("450", "4-5 hrs"), sort: 23 },
  { title: "Premium Detail — Larger ($500-550)", body: premiumBody("500", "4-5 hrs"), sort: 24 },
];

export async function seedTemplates(): Promise<void> {
  await replaceTemplates(STANDARD_TEMPLATES);
  revalidatePath("/ops/templates");
  redirect("/ops/templates?tok=seeded");
}

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
