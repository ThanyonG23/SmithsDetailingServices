/* =====================================================================
   SMITHS GARAGE — coming-soon content source of truth
   ---------------------------------------------------------------------
   Shared by the public /garage waitlist page and the /api/waitlist route
   so the service list a customer ticks always matches what the server
   will accept. No prices here — the coming-soon page shows services and
   the membership, never a number.
   ===================================================================== */

export interface GarageService {
  id: string;
  name: string;
  blurb: string;
  icon: string; // emoji
}

/* The services Smiths Garage will offer. `id` is what the waitlist stores
   when a customer ticks "I'm interested in…"; keep ids stable. */
export const GARAGE_SERVICES: GarageService[] = [
  {
    id: "detailing",
    name: "Car Detailing",
    blurb: "Deep interior + exterior details — the same standard we've built our name on.",
    icon: "✨",
  },
  {
    id: "correction",
    name: "Paint Correction & Coating",
    blurb: "Multi-stage correction and 9-year manufacturer-guaranteed ceramic coating.",
    icon: "🪞",
  },
  {
    id: "servicing",
    name: "Basic Servicing",
    blurb: "Oil, filters, fluids and a safety check — the routine stuff, done right.",
    icon: "🔧",
  },
  {
    id: "touchup",
    name: "Touch-Up Paint",
    blurb: "Scuffed bumpers, stone chips and scratched mirror caps made right again.",
    icon: "🎨",
  },
  {
    id: "headlights",
    name: "Headlight Restoration",
    blurb: "Foggy, yellowed headlights brought back clear — safer and sharper looking.",
    icon: "💡",
  },
  {
    id: "parts",
    name: "Parts Swaps",
    blurb: "Batteries, globes, spark plugs and wipers — fitted while it's with us.",
    icon: "🔩",
  },
];

export const GARAGE_SERVICE_IDS = GARAGE_SERVICES.map((s) => s.id);

/* What a Maintenance Membership member gets — no pricing on the page. */
export const MEMBERSHIP_PERKS: string[] = [
  "Your car detailed inside & out every 3 months — always fresh, never a big clean-up again",
  "A basic service worked in on schedule, so it stays roadworthy without you tracking it",
  "Priority booking — members jump the queue",
  "Free headlight & touch-up top-ups as your car needs them",
  "One simple monthly payment — no surprise bills",
];

export const MEMBERSHIP_NAME = "Smiths Maintenance Membership";
