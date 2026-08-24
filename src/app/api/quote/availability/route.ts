import { NextResponse } from "next/server";
import { getUpcomingAvailability } from "@/lib/availability";
import { VEHICLE_SIZES, type PackageId, type VehicleSize } from "@/lib/packages";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

const PACKAGE_IDS: PackageId[] = ["interior", "premium", "cutpolish", "correction"];

/* Public, no-auth, read-only: which upcoming days have room for a given
   package/size, so the homepage Instant Quote widget can offer real slots.
   Returns only dates + slot labels, no customer data. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const packageId = searchParams.get("package") as PackageId | null;
  const size = searchParams.get("size") as VehicleSize | null;

  if (!packageId || !PACKAGE_IDS.includes(packageId)) {
    return NextResponse.json({ error: "Missing or invalid package." }, { status: 400 });
  }
  if (!size || !VEHICLE_SIZES.includes(size)) {
    return NextResponse.json({ error: "Missing or invalid size." }, { status: 400 });
  }

  try {
    const days = await getUpcomingAvailability(packageId, size, 5);
    return NextResponse.json({ days });
  } catch {
    return NextResponse.json({ error: "Couldn't check availability, try again." }, { status: 502 });
  }
}
