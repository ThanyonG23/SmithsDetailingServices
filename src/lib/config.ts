/* =====================================================================
   SMITHS DETAILING — BUSINESS CONFIG (SINGLE SOURCE OF TRUTH)
   Safe to import on both the server and the client (pure data only).
   Edit prices / packages / extras here and the whole site updates.
   ===================================================================== */

export const BUSINESS = {
  name: "Smiths Detailing Services",
  shortName: "Smiths Detailing",
  phone: "0456 186 696",
  phoneE164: "+61456186696",
  email: "info@smithsdetailingservices.com.au",
  suburb: "Parramatta Park, Cairns",
  // All work is done at our location — customers drop off & pick up.
  address: "209 Bunda Street, Parramatta Park, Cairns QLD",
  tz: "Australia/Brisbane", // Cairns = QLD = UTC+10, no daylight saving
  reviewLink: "https://g.page/r/CVj0x7-guHPPEBM/review",
  instagram: "https://www.instagram.com/",
  logo: "https://cdn.shopify.com/s/files/1/0933/1055/0325/files/New_Logo_EST_2024.png?v=1768796190",
} as const;

/* "Text to book" link — opens the visitor's messaging app with a pre-filled
   message they can complete with their vehicle + package. The "?&body=" form
   is the cross-platform trick that works on both iPhone and Android. */
export const TEXT_TO_BOOK_MESSAGE =
  "Hey Smiths! I'd like a free quote.\n\nMy vehicle: \nMy main concerns are: ";

export const TEXT_TO_BOOK_HREF =
  "sms:" + BUSINESS.phoneE164 + "?&body=" + encodeURIComponent(TEXT_TO_BOOK_MESSAGE);

/* Big background photos for the hero and the final CTA band.
   These are placeholders — for best effect upload your two strongest
   "wow" shots to public/media/photos/ (e.g. hero.jpg + cta.jpg) and
   point these at "/media/photos/hero.jpg" and "/media/photos/cta.jpg". */
export const HERO_IMAGE = "/media/photos/hero-bright.jpg";
export const CTA_IMAGE = "/media/photos/cta.jpg";

/* "Bring Black Back" trim-restoration still (half faded / half restored) */
export const BRING_BLACK_BACK_IMAGE = "/media/photos/bring-black-back.jpg";

/* Gallery before/after sliders */
export const TOUCHUP_BEFORE = "/media/photos/touchup-before.jpg";
export const TOUCHUP_AFTER = "/media/photos/touchup-after.jpg";

export const TOUCHUP_DOOR_BEFORE = "/media/photos/door-damaged.jpg"; // scuffed/scratched door
export const TOUCHUP_DOOR_AFTER = "/media/photos/door-repaired.jpg"; // glossy, repaired

export const HEADLIGHT_BEFORE = "/media/photos/headlight-yellowed.jpg";
export const HEADLIGHT_AFTER = "/media/photos/headlight-clear.jpg";

export const ENGINE_BEFORE = "/media/photos/engine-before.jpg";
export const ENGINE_AFTER = "/media/photos/engine-after.jpg";

export const INTERIOR_BEFORE = "/media/photos/interior-before.jpg";
export const INTERIOR_AFTER = "/media/photos/interior-after.jpg";

/* ---------------------------------------------------------------- */
/* VEHICLES                                                          */
/* ---------------------------------------------------------------- */
export type VehicleKey = "Single Cab" | "Sedan/Dual Cab" | "SUV" | "7 Seater";

export interface VehicleDef {
  key: VehicleKey;
  label: string;
  hint: string;
  image: string;
}

export const VEHICLES: VehicleDef[] = [
  {
    key: "Single Cab",
    label: "Single Cab",
    hint: "Single cab ute",
    image: "/media/photos/single-cab.png",
  },
  {
    key: "Sedan/Dual Cab",
    label: "Sedan / Dual Cab",
    hint: "Sedan, hatch, dual cab",
    image: "/media/photos/dual-cab.png",
  },
  {
    key: "SUV",
    label: "SUV / Wagon",
    hint: "SUV, wagon, 5-seat 4WD",
    image: "/media/photos/suv.png",
  },
  {
    key: "7 Seater",
    label: "7 Seater / Large 4WD",
    hint: "7+ seats, van, large 4WD",
    image: "/media/photos/7-seater.png",
  },
];

export const VEHICLE_KEYS = VEHICLES.map((v) => v.key);

/* ---------------------------------------------------------------- */
/* PACKAGES                                                          */
/* ---------------------------------------------------------------- */
export type PackageKey = "premium" | "cutpolish";

export interface PackageDef {
  key: PackageKey;
  name: string;
  tagline: string;
  durationLabel: string;
  durationMin: number; // used for calendar availability blocking
  sevenAmOnly: boolean; // full-day jobs start at 7am only
  prices: Record<VehicleKey, number>;
  includes: string[];
  image: string;
}

export const PACKAGES: PackageDef[] = [
  {
    key: "premium",
    name: "Premium Interior & Exterior Detail",
    tagline:
      "A full interior reset and exterior restoration that makes your car feel new again.",
    durationLabel: "2–5 hrs",
    durationMin: 270,
    sevenAmOnly: false,
    prices: { "Single Cab": 300, "Sedan/Dual Cab": 350, SUV: 380, "7 Seater": 400 },
    includes: [
      "Carpet shampoo & extraction",
      "Steam cleaning",
      "Plastic rejuvenation",
      "Full exterior wash & dry",
      "Streak-free glass inside & out",
      "Tyres dressed & shined",
    ],
    image:
      "https://cdn.shopify.com/s/files/1/0933/1055/0325/files/IMG_9133.jpg?v=1768791449",
  },
  {
    key: "cutpolish",
    name: "Premium Full Detail + Cut & Polish",
    tagline:
      "Everything in the Premium detail, plus a full cut & polish to restore deep gloss and clarity.",
    durationLabel: "Full day",
    durationMin: 600,
    sevenAmOnly: true,
    prices: { "Single Cab": 650, "Sedan/Dual Cab": 700, SUV: 750, "7 Seater": 800 },
    includes: [
      "Everything in the Premium Detail",
      "Decontamination wash",
      "Clay bar treatment",
      "1-step cut + 1-step polish",
      "Hand wax sealant for gloss & protection",
      "Paint left smooth, glossy & photo-ready",
    ],
    image:
      "https://cdn.shopify.com/s/files/1/0933/1055/0325/files/IMG_9226.jpg?v=1769392524",
  },
];

export function getPackage(key: string): PackageDef | undefined {
  return PACKAGES.find((p) => p.key === key);
}

/* ---------------------------------------------------------------- */
/* EXTRAS — priced per vehicle                                      */
/* ---------------------------------------------------------------- */
export type ExtraKey = "dog" | "engine" | "plastic" | "leather" | "wax";

export interface ExtraDef {
  key: ExtraKey;
  label: string;
  desc: string;
  prices: Record<VehicleKey, number>;
  image: string;
  // If set, this extra is only offered for these packages (e.g. Hand Wax is
  // already included in the Cut & Polish package, so it's Premium-only).
  onlyFor?: PackageKey[];
}

export const EXTRAS: ExtraDef[] = [
  {
    key: "dog",
    label: "Dog Hair Removal",
    desc: "Heavy pet-hair removal from carpets, seats and boot.",
    prices: { "Single Cab": 35, "Sedan/Dual Cab": 55, SUV: 55, "7 Seater": 55 },
    image: "/media/photos/pet-hair.png",
  },
  {
    key: "engine",
    label: "Engine Bay Clean",
    desc: "Deep engine bay clean with plastics dressed and protected.",
    prices: { "Single Cab": 85, "Sedan/Dual Cab": 85, SUV: 85, "7 Seater": 85 },
    image:
      "https://cdn.shopify.com/s/files/1/0933/1055/0325/files/IMG_9134.jpg?v=1768791452",
  },
  {
    key: "plastic",
    label: "Exterior Plastic Restore",
    desc: "Bring faded exterior trims back to a deep factory black.",
    prices: { "Single Cab": 55, "Sedan/Dual Cab": 85, SUV: 85, "7 Seater": 100 },
    image: "/media/photos/plastic-restore.jpg",
  },
  {
    key: "leather",
    label: "Leather Conditioner",
    desc: "Clean, condition and protect your leather surfaces.",
    prices: { "Single Cab": 55, "Sedan/Dual Cab": 85, SUV: 85, "7 Seater": 100 },
    image:
      "https://cdn.shopify.com/s/files/1/0933/1055/0325/files/leather_conditoner.jpg?v=1771811978",
  },
  {
    key: "wax",
    label: "Hand Wax",
    desc: "A premium hand wax for a glossy finish and added paint protection.",
    prices: { "Single Cab": 35, "Sedan/Dual Cab": 55, SUV: 85, "7 Seater": 100 },
    image: "/media/photos/hand-wax.jpg",
    onlyFor: ["premium"], // included in the Cut & Polish package, so Premium-only
  },
];

export function getExtra(key: string): ExtraDef | undefined {
  return EXTRAS.find((e) => e.key === key);
}

export function extraPrice(extra: ExtraDef, vehicle: VehicleKey): number {
  return extra.prices[vehicle] ?? 0;
}

/* ---------------------------------------------------------------- */
/* SERVICES — the main homepage showcase                            */
/*                                                                  */
/* PHOTOS: each service currently uses a placeholder. Drop your own  */
/* shots into public/media/photos/services/ using the filename in    */
/* each `image` comment, then change the `image` value to match.     */
/* See public/media/photos/services/README.md for the full list.     */
/* ---------------------------------------------------------------- */
export interface ServiceDef {
  key: string;
  eyebrow: string; // small uppercase label above the headline
  name: string; // plain name (used in pills / alt text)
  headline: string; // first part of the big headline
  accentWord: string; // coloured part of the headline
  desc: string;
  steps: string[]; // checklist that staggers in
  image: string;
  accent: "yellow" | "green";
}

export const SERVICES: ServiceDef[] = [
  {
    key: "interior",
    eyebrow: "Interior",
    name: "Deep Interior Clean",
    headline: "Every surface,",
    accentWord: "brought back to new.",
    desc: "Not a vacuum and a wipe. We pull the dirt out of the carpets, steam through the grime and dirt, and bring faded plastics back to life. You get in and it smells and feels like a different car.",
    steps: [
      "Carpet shampoo & carpet extraction",
      "Steam cleaned",
      "Plastics & trim rejuvenated",
      "Glass left completely streak-free",
    ],
    image: "/media/photos/interior-after.jpg",
    accent: "yellow",
  },
  {
    key: "wash",
    eyebrow: "Exterior",
    name: "Exterior Wash",
    headline: "A proper wash.",
    accentWord: "Not a quick rinse.",
    desc: "Wheels and arches first, then a snow-foam pre-soak to lift the grit before anything touches your paint. Washed by hand, dried by hand, so you don't trade dirt for swirl marks and water spots.",
    steps: [
      "Wheels & arches decontaminated first",
      "Snow-foam pre-soak lifts the grit",
      "Safe contact wash",
      "Hand dried, no water spots",
    ],
    image: "/media/photos/exterior-wash.jpg",
    accent: "green",
  },
  {
    key: "cutpolish",
    eyebrow: "Paint",
    name: "Cut & Polish",
    headline: "Cut back the haze,",
    accentWord: "bring back the gloss.",
    desc: "Years of washing leaves paint dull and full of fine scratches. We decontaminate, clay, then machine cut and refine until the colour has depth again, and seal it so it lasts.",
    steps: [
      "Full decontamination & clay bar",
      "One-step machine cut removes defects",
      "Refined polish for true clarity",
      "Ceramic spray sealant, 3-month protection",
    ],
    // ideal upload: services/cut-polish.jpg
    image: "https://cdn.shopify.com/s/files/1/0933/1055/0325/files/IMG_9226.jpg?v=1769392524",
    accent: "yellow",
  },
  {
    key: "correction",
    eyebrow: "Paint correction",
    name: "Multi-Stage Paint Correction",
    headline: "For paint that",
    accentWord: "deserves perfect.",
    desc: "Our most involved paint work. Multiple compounding and refining stages, checked under inspection lighting between each pass, until the finish is as close to flawless as your paint will allow.",
    steps: [
      "Paint depth measured & assessed",
      "Compounding stage for deeper defects",
      "Refining stages for true clarity",
      "Checked under inspection lighting",
    ],
    image: "/media/photos/paint-gloss.jpg",
    accent: "green",
  },
  {
    key: "headlights",
    eyebrow: "Headlights",
    name: "Headlight Restoration",
    headline: "Yellowed and foggy?",
    accentWord: "See clearly again.",
    desc: "Cloudy headlights make a good car look tired, and they cut how far you can see at night. We sand back the oxidised layer, polish to full clarity, then seal them so they stay clear.",
    steps: [
      "Wet-sanded through the grit stages",
      "Machine polished to full clarity",
      "UV sealant applied to stop re-fogging",
      "Night-time visibility restored",
    ],
    image: "/media/photos/headlight-clear.jpg",
    accent: "yellow",
  },
  {
    key: "touchup",
    eyebrow: "Touch-ups",
    name: "Touch Up Paint",
    headline: "Make the chips",
    accentWord: "disappear.",
    desc: "Stone chips and car park scratches are the first thing a buyer notices. We match your factory paint code, fill carefully, then level and polish so the repair blends into the panel.",
    steps: [
      "Colour matched to your paint code",
      "Chips & scratches carefully filled",
      "Levelled and polished flush",
      "Blended into the surrounding panel",
    ],
    image: "/media/photos/touchup-after.jpg",
    accent: "green",
  },
  {
    key: "ceramic",
    eyebrow: "Protection",
    name: "Ceramic Coatings",
    headline: "Protection that lasts",
    accentWord: "years, not weeks.",
    desc: "A wax lasts a few months. A ceramic coating bonds to your paint and forms a hard, glossy shell that repels water and dirt, so your car stays cleaner, washes easier, and holds its shine for years.",
    steps: [
      "Paint corrected & prepped first",
      "Coating applied panel by panel",
      "Cured to a hard, glossy shell",
      "Easier washing, lasting gloss",
    ],
    // ideal upload: services/ceramic.jpg
    image: "/media/photos/hand-wax.jpg",
    accent: "yellow",
  },
];

/* ---------------------------------------------------------------- */
/* REELS — homepage "Watch real results" videos (self-hosted)       */
/* Put your MP4 files in public/media/videos/ with these names       */
/* (or tell me your filenames and I'll update this list).            */
/* ---------------------------------------------------------------- */
export const REELS: string[] = [
  "/media/videos/video1.mp4",
  "/media/videos/video2.mp4",
  "/media/videos/video3.mp4",
  "/media/videos/video4.mp4",
];

/* ---------------------------------------------------------------- */
/* GOOGLE REVIEWS                                                    */
/* Real 5-star reviews. Update the rating/count from your Google     */
/* profile, and add more here anytime.                               */
/* ---------------------------------------------------------------- */
export interface Review {
  name: string;
  time: string;
  text: string;
}

export const REVIEW_RATING = 4.8;
export const REVIEW_COUNT = 111;

export const REVIEWS: Review[] = [
  {
    name: "Ricky Palmer",
    time: "3 months ago",
    text: "Amazing service, arrived on time, did an amazing job. The 4x4 has not looked this good since it left the showroom. Highly recommend.",
  },
  {
    name: "Cassandra French",
    time: "4 months ago",
    text: "After 2 years of Husky hair, dirt and general use, my car looks, smells and feels new. Amazing, fantastic work. Punctual, respectful, will definitely use again.",
  },
  {
    name: "Thomas Scullion",
    time: "3 months ago",
    text: "Couldn't be happier with the service. Showed incredible professionalism and attention to detail, taking the time to make sure everything was perfect.",
  },
  {
    name: "Zakeira Sloss",
    time: "10 months ago",
    text: "Love, love the detailing done to my car. Makes me feel like I'm driving a brand new car again, especially with the hand wax! Will definitely be doing my monthly detailing with Smiths.",
  },
  {
    name: "Ken Olson",
    time: "9 months ago",
    text: "I am more than impressed with the professional detailing work performed by Smiths Detailing in Cairns. Enjoy, and thank you so much!",
  },
  {
    name: "Tamara B",
    time: "10 months ago",
    text: "Honestly amazing! I can't praise Smiths Detailing enough. With 6 kids my car was so messy, but it now looks brand new again.",
  },
  {
    name: "Raiden Dolder",
    time: "5 months ago",
    text: "Quality service all around. Easy to organise and convenient. The work done is definitely worth the money. Would recommend to others.",
  },
  {
    name: "Natacha Amora",
    time: "11 months ago",
    text: "Easy to book in, friendly staff and amazing work. Didn't recognise the car after the full detail job! Highly recommend!",
  },
  {
    name: "Daniel Reid",
    time: "10 months ago",
    text: "Quality detail and good customer service, definitely the shiniest car in the carpark considering it's almost 6 years old. They've done a good job.",
  },
  {
    name: "Marilyn Green",
    time: "11 months ago",
    text: "Excellent customer service. Car looks brand new after the full detail. The team took pride in their attention to detail. I'll certainly be a repeat customer.",
  },
  {
    name: "Katie Carter",
    time: "8 months ago",
    text: "Absolutely stoked with the job these guys did. Car looks mint, was ready ahead of time, price was good and the staff are lovely. Will be using these guys again.",
  },
  {
    name: "Raymond Guy",
    time: "8 months ago",
    text: "Absolutely great service from the admin to the brilliant detailing. My car was not in the best condition, but the finished product is amazing. Like new!",
  },
  {
    name: "Istvan Dobo",
    time: "10 months ago",
    text: "Great service, polite, helpful and made the car look brand new inside and out. Highly recommend.",
  },
  {
    name: "Elizabeth Cougan",
    time: "9 months ago",
    text: "Smiths Detailing did a fantastic job on our car! It's like driving a new Prado again. Staff are friendly and clearly value quality work.",
  },
  {
    name: "Byron Hodges",
    time: "11 months ago",
    text: "Great service, car went in looking filthy and came out looking brand new at an affordable price! 100% recommend.",
  },
  {
    name: "Shane Rennie",
    time: "11 months ago",
    text: "Great service, 5 year old Navara came out looking brand new! Great communication as well. Will definitely come back!",
  },
  {
    name: "Rachel Aitkin",
    time: "5 months ago",
    text: "Paws-itively impressed! Smiths Detailing did a great job removing dog hair and cleaning our car. Very impressed and highly recommend!",
  },
  {
    name: "Louisa Salee",
    time: "9 months ago",
    text: "Excellent, professional and friendly service. Worth every dollar spent 👏",
  },
  {
    name: "Sue Dickason",
    time: "10 months ago",
    text: "On returning to driving after breaking my wrist, I took my car to Smiths Detailing who brought out the 'inner new car' again. Enjoying that new car feeling all over again!",
  },
  {
    name: "Jodi & Tyler",
    time: "1 year ago",
    text: "Absolutely thrilled with how my car turned out! It was covered in dog hair and definitely due for a good clean. Thanks so much, highly recommend!",
  },
  {
    name: "Sarah Wilkes",
    time: "1 year ago",
    text: "Recently got a full detail on my MUX and the team did an incredible job! Car is looking brand new.",
  },
  {
    name: "Courtney Black",
    time: "1 year ago",
    text: "Amazing job on our car. We were blown away how great our car turned out. Highly recommend and will be telling friends!",
  },
];

/* ---------------------------------------------------------------- */
/* TIME SLOTS                                                        */
/* ---------------------------------------------------------------- */
export interface SlotDef {
  key: "0700" | "1130";
  label: string;
  hour: number;
  minute: number;
}

export const SLOTS: SlotDef[] = [
  { key: "0700", label: "7:00 AM", hour: 7, minute: 0 },
  { key: "1130", label: "11:30 AM", hour: 11, minute: 30 },
];

export function getSlot(key: string): SlotDef | undefined {
  return SLOTS.find((s) => s.key === key);
}

/* ---------------------------------------------------------------- */
/* HELPERS                                                          */
/* ---------------------------------------------------------------- */
export function money(n: number): string {
  return "$" + Number(n || 0).toLocaleString("en-AU");
}

export function basePrice(pkg: PackageDef, vehicle: VehicleKey): number {
  return pkg.prices[vehicle] ?? 0;
}
