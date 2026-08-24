/* Membership vehicle tiers + their Stripe payment links.
   Shared by the sign-up page (/membership/join) and the "skip the call"
   section on the landing page, so the links live in one place. */
export type MembershipTier = {
  key: string;
  emoji: string;
  desc: string;
  weekly: number; // ongoing $/week
  first: number; // first-visit (sign-up) price
  link: string; // Stripe payment link
};

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    key: "Single Cab",
    emoji: "🛻",
    desc: "Single cabs & small utes",
    weekly: 39,
    first: 630,
    link: "https://buy.stripe.com/5kQ7sL9Ic6DH8eIbCb6kg0v",
  },
  {
    key: "Sedan / Dual Cab",
    emoji: "🚗",
    desc: "Sedans, hatches & dual cabs",
    weekly: 49,
    first: 680,
    link: "https://buy.stripe.com/fZu3cv1bG0fj2Uo21B6kg0w",
  },
  {
    key: "SUV",
    emoji: "🚙",
    desc: "SUVs & wagons",
    weekly: 59,
    first: 730,
    link: "https://buy.stripe.com/fZu14n7A45zDdz2bCb6kg0x",
  },
  {
    key: "7 Seater",
    emoji: "🚐",
    desc: "7-seaters & people movers",
    weekly: 69,
    first: 780,
    link: "https://buy.stripe.com/4gM00j7A43rv2Uo8pZ6kg0y",
  },
];
