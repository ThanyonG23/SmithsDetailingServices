/* The onboarding / discovery questions for a Sales client, grouped into sections.
   Shared by the onboarding form and the save action so the keys always match.
   The four header fields (business, contact, phone, email) plus stage are stored
   as columns; everything here is stored in the client's `details` JSONB. */

export type FieldType = "text" | "textarea" | "select";
export interface ClientField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  hint?: string;
  star?: boolean; // must-get on the call
}
export interface ClientSection {
  title: string;
  fields: ClientField[];
}

export const CLIENT_SECTIONS: ClientSection[] = [
  {
    title: "Services & pricing",
    fields: [
      { key: "services", label: "Services offered", type: "textarea", star: true },
      { key: "pricing", label: "Pricing / average job value per service", type: "textarea", star: true, hint: "e.g. $70/hr, regular clean ~$180, bond clean ~$450" },
      { key: "most_profitable", label: "Most profitable service", type: "text" },
      { key: "big_ticket", label: "Biggest one-off ticket (bond, commercial, carpet)", type: "text", star: true },
      { key: "costs", label: "Rough costs / margin per job", type: "text" },
      { key: "want_more", label: "Service they want more of", type: "text" },
    ],
  },
  {
    title: "Capacity & delivery",
    fields: [
      { key: "capacity", label: "Jobs per week they can take now", type: "text", star: true },
      { key: "staff", label: "Staff / can they scale up", type: "text" },
      { key: "area", label: "Service area / suburbs (and any they won't)", type: "textarea", star: true },
      { key: "turnaround", label: "How fast they can take a new job", type: "text" },
    ],
  },
  {
    title: "Customer & market",
    fields: [
      { key: "best_customer", label: "Best customer (residential vs commercial, who)", type: "text" },
      { key: "lead_sources", label: "Where customers come from now", type: "text" },
      { key: "competitors", label: "Main competitors", type: "text" },
      { key: "usp", label: "Their edge / what makes them better", type: "textarea" },
      { key: "social_proof", label: "Google rating, reviews, testimonials", type: "text", star: true },
      { key: "objections", label: "Why people hesitate / don't book", type: "textarea" },
    ],
  },
  {
    title: "The numbers",
    fields: [
      { key: "monthly_baseline", label: "Current monthly revenue / jobs (baseline)", type: "text", star: true },
      { key: "client_lifetime", label: "How long a regular client stays", type: "text" },
      { key: "close_rate", label: "Close rate (quotes to bookings)", type: "text" },
    ],
  },
  {
    title: "The offer",
    fields: [
      { key: "intro_offer", label: "Possible first-time / intro offer", type: "textarea" },
      { key: "seasonality", label: "Busy and quiet periods", type: "text" },
    ],
  },
  {
    title: "Assets & access",
    fields: [
      { key: "socials", label: "Instagram / Facebook / TikTok handles", type: "text", star: true },
      { key: "website", label: "Website", type: "text" },
      { key: "google_profile", label: "Google Business Profile access?", type: "text" },
      { key: "abn_insurance", label: "ABN, insurance, licences", type: "text", star: true },
      { key: "brand_assets", label: "Logo, colours, photos/videos of work", type: "textarea" },
      { key: "tracking_number", label: "OK to set up a tracking number?", type: "text", star: true },
    ],
  },
  {
    title: "Commission & terms",
    fields: [
      {
        key: "commission_regular",
        label: "Regular cleans commission",
        type: "select",
        star: true,
        options: ["100% of first clean, they keep the client", "20% recurring every clean", "Not decided yet"],
      },
      { key: "commission_oneoff", label: "One-off jobs split", type: "text", hint: "e.g. 70% them / 30% us" },
      { key: "term", label: "Contract term", type: "text", hint: "e.g. 6 months" },
      { key: "ad_spend", label: "Who funds the ad spend", type: "text", star: true },
      { key: "billing", label: "How / when we invoice our cut", type: "text" },
    ],
  },
  {
    title: "Success & expectations",
    fields: [
      { key: "success_goal", label: "What success looks like in 6 months", type: "textarea", star: true },
      { key: "speed_to_lead", label: "How fast they answer / return a lead", type: "text" },
    ],
  },
  {
    title: "Notes",
    fields: [{ key: "notes", label: "Anything else", type: "textarea" }],
  },
];

export const CLIENT_DETAIL_KEYS: string[] = CLIENT_SECTIONS.flatMap((s) => s.fields.map((f) => f.key));

export const CLIENT_STAGES = ["onboarding", "building", "live", "paused", "ended"] as const;
