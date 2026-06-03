import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getPackage, SLOTS } from "@/lib/config";
import { slotStartUtc, addMinutes, todayInCairns } from "@/lib/time";

export const dynamic = "force-dynamic";

/* GET /api/availability?date=YYYY-MM-DD&package=premium
   Returns the 7am / 1pm slots with availability for that package + date. */
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") || "";
  const pkgKey = req.nextUrl.searchParams.get("package") || "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ ok: false, error: "Invalid date" }, { status: 400 });
  }
  const pkg = getPackage(pkgKey);
  if (!pkg) {
    return NextResponse.json({ ok: false, error: "Unknown package" }, { status: 400 });
  }

  const isPast = date < todayInCairns();

  const dayStart = slotStartUtc(date, 0, 0);
  const dayEnd = addMinutes(dayStart, 24 * 60);

  let busy: { s: number; e: number }[] = [];
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("bookings")
      .select("start_at,end_at")
      .eq("status", "confirmed")
      .lt("start_at", dayEnd.toISOString())
      .gt("end_at", dayStart.toISOString());

    if (error) throw error;
    busy = (data || []).map((b: { start_at: string; end_at: string }) => ({
      s: new Date(b.start_at).getTime(),
      e: new Date(b.end_at).getTime(),
    }));
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Lookup failed" },
      { status: 500 }
    );
  }

  const slots = SLOTS.map((s) => {
    const start = slotStartUtc(date, s.hour, s.minute);
    const end = addMinutes(start, pkg.durationMin);
    const blockedByRule = pkg.sevenAmOnly && s.key !== "0700";

    let available = !blockedByRule && !isPast;
    if (available) {
      const overlap = busy.some((b) => b.s < end.getTime() && b.e > start.getTime());
      available = !overlap;
    }

    return { key: s.key, label: s.label, available, blockedByRule };
  });

  return NextResponse.json({
    ok: true,
    date,
    package: pkg.key,
    durationMin: pkg.durationMin,
    slots,
  });
}
