/* =====================================================================
   SMITHS DETAILING, PACKAGE / PRICING SOURCE OF TRUTH
   ---------------------------------------------------------------------
   Shared by the /ops quote-template library (src/app/ops/actions.ts) and
   the public "Instant Quote" widget, so a price can never drift between
   what staff paste to a lead and what the AI widget quotes on the site.
   Edit prices here and BOTH surfaces update.
   ===================================================================== */

export type VehicleSize = "Single Cab" | "Sedan/Dual Cab" | "SUV" | "7 Seater";
export const VEHICLE_SIZES: VehicleSize[] = ["Single Cab", "Sedan/Dual Cab", "SUV", "7 Seater"];

export type PackageId = "interior" | "premium" | "cutpolish" | "correction";

export const PACKAGE_TITLES: Record<PackageId, string> = {
  interior: "Interior Only",
  premium: "Premium Detail",
  cutpolish: "Premium + Cut & Polish",
  correction: "Exterior Correction & Ceramic Coating",
};

/* Priorities a customer can tick on the Instant Quote widget. */
export type Priority = "interior" | "exterior" | "cutpolish" | "correction";
export const PRIORITY_OPTIONS: { id: Priority; label: string }[] = [
  { id: "interior", label: "Interior" },
  { id: "exterior", label: "Exterior Wash" },
  { id: "cutpolish", label: "Cut & Polish" },
  { id: "correction", label: "Paint Correction & Paint Protection" },
];

/* Which real package best covers a set of ticked priorities. Correction
   already includes ceramic coating, and Premium Detail already includes the
   exterior wash, there's no standalone "exterior only" or "coating only"
   product, so those fold into the nearest package that covers them. */
export function resolvePackage(priorities: Priority[]): PackageId {
  const has = (p: Priority) => priorities.includes(p);
  if (has("correction")) return "correction";
  if (has("cutpolish")) return "cutpolish";
  if (has("interior") && has("exterior")) return "premium";
  if (has("interior")) return "interior";
  return "premium"; // exterior-only (or nothing ticked), closest real product
}

const INTERIOR_PRICE: Record<VehicleSize, number> = {
  "Single Cab": 250,
  "Sedan/Dual Cab": 300,
  SUV: 330,
  "7 Seater": 350,
};

const PREMIUM: Record<VehicleSize, { price: number; hrs: string }> = {
  "Single Cab": { price: 350, hrs: "3-4 hrs" },
  "Sedan/Dual Cab": { price: 400, hrs: "3-4 hrs" },
  SUV: { price: 430, hrs: "3-4 hrs" },
  "7 Seater": { price: 450, hrs: "4-5 hrs" },
};

const CUTPOLISH_PRICE: Record<VehicleSize, number> = {
  "Single Cab": 850,
  "Sedan/Dual Cab": 1000,
  SUV: 1100,
  "7 Seater": 1200,
};

const PREMIUM_POLISH_PRICE: Record<VehicleSize, number> = {
  "Single Cab": 500,
  "Sedan/Dual Cab": 600,
  SUV: 650,
  "7 Seater": 700,
};

const STANDARD_PRICE: Record<VehicleSize, number> = {
  "Single Cab": 300,
  "Sedan/Dual Cab": 350,
  SUV: 380,
  "7 Seater": 400,
};

/* bonus = the other free upgrades' value, total = the price charged today.
   The FREE interior detail's value is NOT stored here, it's read live from
   INTERIOR_PRICE so the "valued at $X" in the quote always matches current
   interior pricing and can never drift. */
const CORRECTION: Record<VehicleSize, { bonus: number; total: number }> = {
  "Single Cab": { bonus: 400, total: 1500 },
  "Sedan/Dual Cab": { bonus: 450, total: 2100 },
  SUV: { bonus: 500, total: 2200 },
  "7 Seater": { bonus: 535, total: 2300 },
};

export function packagePrice(id: PackageId, size: VehicleSize): number {
  switch (id) {
    case "interior":
      return INTERIOR_PRICE[size];
    case "premium":
      return PREMIUM[size].price;
    case "cutpolish":
      return CUTPOLISH_PRICE[size];
    case "correction":
      return CORRECTION[size].total;
  }
}

/* Same day-capacity weighting the /ops dashboard already uses for real
   bookings (a full day = 2 units): a correction is always 1 unit; anything
   else is 0.5 if it's a $700+ job, else 0.25. Used to check whether a given
   package/size would fit into a day's remaining room. */
export function packageUnit(id: PackageId, size: VehicleSize): number {
  if (id === "correction") return 1;
  return packagePrice(id, size) >= 700 ? 0.5 : 0.25;
}

const LOC = "📍 209 Bunda Street, Parramatta Park, Cairns QLD";
const GUARANTEE = "💯 If you're not happy: You don't pay.";
const BOOK = "Would you like to book this in?";

/* `vehicle` personalises the greeting (used by the public quote widget);
   omit it for the generic copy-paste templates used in /ops/templates. */
function greeting(vehicle?: string): string {
  return vehicle ? `your ${vehicle}` : "your vehicle";
}

export function correctionBody(size: VehicleSize, vehicle?: string): string {
  const { bonus, total } = CORRECTION[size];
  // Free interior is valued at the real Interior Only price, always in sync.
  const interior = INTERIOR_PRICE[size];
  return `Hey! We can definitely take care of ${greeting(vehicle)} with our Exterior Correction Package
Our Exterior Correction Package Also Includes:

✅ Contact Wash
✅ Decontamination Wash
✅ Clay Bar Treatment
✅ Multi Stage Paint Correction
✅ 9 Year Manufacturer-Guaranteed Ceramic Coating

🎁 BONUS #1: FREE Premium Interior Detail (Valued At $${interior})

🎁 BONUS #2: LIMITED TIME FREE UPGRADES
✅ Engine Bay Detail
✅ Exterior Plastic Restore

Bonus Free Inclusions: $${bonus}
Total Price Today: $${total.toLocaleString("en-AU")}

⏱️ 1-2 days turnaround
${LOC}

${GUARANTEE}

${BOOK}`;
}

export function interiorBody(size: VehicleSize, vehicle?: string): string {
  const price = INTERIOR_PRICE[size];
  return `Hey! We can definitely take care of ${greeting(vehicle)} with our Premium Interior Package
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

/* Low-level renderer, exposed for the one legacy "Larger vehicle" quote
   (bigger than the 4 standard sizes) that /ops/templates still offers,   everything else should go through premiumBody(size, vehicle). */
export function premiumBodyRaw(price: string, hrs: string, vehicle?: string): string {
  return `Hey! We can definitely take care of ${greeting(vehicle)} with our Premium Interior & Exterior Detail
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

export function premiumBody(size: VehicleSize, vehicle?: string): string {
  const { price, hrs } = PREMIUM[size];
  return premiumBodyRaw(String(price), hrs, vehicle);
}

export function cutPolishBody(size: VehicleSize, vehicle?: string): string {
  const price = CUTPOLISH_PRICE[size];
  return `Hey! We can definitely take care of ${greeting(vehicle)} with our Premium Interior & Exterior Detail + Cut & Polish Package
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
💰 $${price.toLocaleString("en-AU")}
${LOC}

${GUARANTEE}

${BOOK}`;
}

/* "Premium Detail + Polish", a mid-tier full detail with a 1-step paint
   enhancement, above Premium Detail and below Cut & Polish. Template-only for
   now (not part of the Instant Quote widget's PackageId ladder). */
export function premiumPolishBody(size: VehicleSize, vehicle?: string): string {
  const price = PREMIUM_POLISH_PRICE[size];
  return `Hey! We can definitely take care of ${greeting(vehicle)} with our Premium Detail + Polish Package
This package also includes:

✅ Carpet Shampoo & Extraction
✅ Plastic Rejuvenation
✅ Full Exterior Wash
✅ Decontamination Wash
✅ Clay Bar Treatment
✅ 1 Step Paint Enhancement
✅ Ceramic Spray Sealant

⏱️ 24 hour turnaround
💰 $${price.toLocaleString("en-AU")}
${LOC}

${GUARANTEE}

${BOOK}`;
}

/** "Standard Detail", a full interior + exterior wash tier below Premium. */
export function standardBody(size: VehicleSize, vehicle?: string): string {
  const price = STANDARD_PRICE[size];
  return `Hey! We can definitely take care of ${greeting(vehicle)}, here is our Standard Detail Package
This package also includes:

✅ Deep Interior Clean
✅ Plastic Rejuvenation
✅ Full Exterior Wash & Dry
✅ Tyre Shine

⏱️ Takes 2-3 hrs
💵 $${price}
${LOC}

${GUARANTEE}

${BOOK}`;
}

export function buildPackageBody(id: PackageId, size: VehicleSize, vehicle?: string): string {
  switch (id) {
    case "interior":
      return interiorBody(size, vehicle);
    case "premium":
      return premiumBody(size, vehicle);
    case "cutpolish":
      return cutPolishBody(size, vehicle);
    case "correction":
      return correctionBody(size, vehicle);
  }
}

export interface QuoteResult {
  packageId: PackageId;
  title: string;
  price: number;
  body: string;
}

export function buildQuote(priorities: Priority[], size: VehicleSize, vehicle?: string): QuoteResult {
  const packageId = resolvePackage(priorities);
  return {
    packageId,
    title: PACKAGE_TITLES[packageId],
    price: packagePrice(packageId, size),
    body: buildPackageBody(packageId, size, vehicle),
  };
}

/** Compact package + price table for the AI lead-follow-up helper, so it can
    size up a vehicle and suggest the right alternative package. Built from the
    same price source above, so the AI's numbers can never drift from staff's. */
export function priceReferenceForAI(): string {
  const asMap = (id: PackageId): Record<VehicleSize, number> =>
    Object.fromEntries(VEHICLE_SIZES.map((s) => [s, packagePrice(id, s)])) as Record<VehicleSize, number>;
  const row = (title: string, prices: Record<VehicleSize, number>, bestFor: string) => {
    const cells = VEHICLE_SIZES.map((s) => `${s} $${prices[s].toLocaleString("en-AU")}`).join(" · ");
    return `${title}\n  Best for: ${bestFor}\n  ${cells}`;
  };
  // Cheapest → dearest, each with what it's actually for.
  return [
    row("Interior Only", asMap("interior"),
      "inside only, vacuum, shampoo, extraction, plastics, windows. Dirty/smelly interior, kids or pets, no paint work wanted."),
    row("Standard Detail", STANDARD_PRICE,
      "our entry full detail inside AND out, deep interior, plastic rejuv, exterior wash & dry, tyre shine. A solid all-round clean on a budget (no carpet shampoo/extraction or sealant, no polishing)."),
    row("Premium Detail", asMap("premium"),
      "the step up from Standard, everything in it PLUS carpet shampoo & extraction and a ceramic spray sealant. The best all-round refresh, still no polishing."),
    row("Premium Detail + Polish", PREMIUM_POLISH_PRICE,
      "the full detail PLUS a 1-step paint enhancement for extra gloss and to knock back light swirls. The step up when they want the paint to pop but don't need full correction."),
    row("Premium + Cut & Polish", asMap("cutpolish"),
      "the full detail PLUS a 1-step cut and 1-step polish for heavier swirls, oxidation, dull tired paint, bringing it back without a coating."),
    row("Exterior Correction & Ceramic Coating", asMap("correction"),
      "the top job, multi-stage paint correction + 9-year manufacturer-guaranteed ceramic coating, and it includes a FREE interior detail + bonus upgrades. For someone who wants the best finish and long-term protection."),
  ].join("\n\n");
}
