/* =====================================================================
   CONTENT & REFERRAL AGREEMENT
   ---------------------------------------------------------------------
   The terms detailers accept before setting up their accounts, shown on
   /team/social-setup.

   ⚠️ Bump AGREEMENT_VERSION whenever you change the wording, and get
   everyone to re-accept. An acceptance is only worth anything if you can
   show which version they agreed to.

   ⚠️ This was drafted as a plain-English internal policy, not by a
   lawyer. Have it checked before you rely on it in a dispute.
   ===================================================================== */

export const AGREEMENT_VERSION = "v1.0, 22 July 2026";

export interface Clause {
  heading: string;
  points: string[];
}

export const AGREEMENT: Clause[] = [
  {
    heading: "Your account represents Smiths",
    points: [
      "Your account carries the Smiths Detailing name, so what you post reflects on the whole business and everyone who works here.",
      "Post your own work, or work you took part in. Don't post someone else's results as your own, and don't repost other detailers' content as if we did it.",
      "Don't quote prices, promise a turnaround time, or guarantee a result on a specific car. Send those enquiries to the shop — it's how we avoid promising something we can't deliver.",
      "Keep it clean. No content that would embarrass a customer, another staff member, or the business.",
    ],
  },
  {
    heading: "Hold the standard",
    points: [
      "Only post work that's actually finished and up to our standard. A half-done car in a video tells every future customer that's what they're paying for.",
      "Before-and-afters have to be honest. Same car, same angles, no misleading edits.",
      "If the shop asks you to take something down, take it down first and we'll talk about it after.",
    ],
  },
  {
    heading: "Customers and their cars",
    points: [
      "Always ask the customer before you film their vehicle.",
      "Keep number plates out of shot, and never film personal belongings left in a car.",
      "Never share a customer's name, address, phone number, or anything about their booking.",
      "If a customer asks you to remove a post, remove it that day.",
    ],
  },
  {
    heading: "Respect for the business",
    points: [
      "Don't publicly run down Smiths Detailing, our customers, or the people you work with — not on your account, not in comments, not in DMs.",
      "Take disagreements to Thanyon directly rather than to your followers.",
      "This clause is about public commentary only. Nothing here stops you raising a concern or a complaint, reporting a safety or pay issue to a regulator or union, or exercising any right you have under the Fair Work Act. You will never be penalised for doing any of those things.",
    ],
  },
  {
    heading: "Safety",
    points: [
      "Never film while driving a customer's vehicle or your own.",
      "Filming comes second to doing the job safely and properly. If it's getting in the way, put the phone down.",
    ],
  },
  {
    heading: "How the 10% works",
    points: [
      "You earn 10% of the final invoice on jobs booked through your personal referral link, once the customer has paid in full.",
      "New customers only. It isn't payable on walk-ins, on customers already on our books, or on repeat bookings from someone you didn't originally bring in.",
      "Minimum $50 per qualifying job, so smaller jobs are still worth tagging.",
      "Nothing is payable on a job that's refunded or not paid for under our satisfaction guarantee.",
      "Paid monthly with your normal wages. It's on top of your usual pay, not instead of it, and superannuation applies to it as normal.",
      "Don't ask walk-in or existing customers to use your link. That's not a referral, and it's the fastest way to end the program for everyone.",
    ],
  },
  {
    heading: "Use of your content",
    points: [
      "You give Smiths Detailing permission to re-post and advertise with any content you make of Smiths work, including after you stop working here.",
      "We may put ad spend behind your posts. That's good for you while you're here — it puts your referral link in front of far more people.",
      "You keep your account and your login. We're not asking for it.",
    ],
  },
  {
    heading: "If you leave",
    points: [
      "Within 7 days, remove Smiths Detailing from your account name, handle and bio, and take down your referral link.",
      "Any commission you've already earned on paid jobs will still be paid to you.",
      "Your referral link is retired. It won't be given to anyone else.",
    ],
  },
  {
    heading: "The rest",
    points: [
      "This sits alongside your employment agreement and your award entitlements — it doesn't replace or reduce either of them.",
      "We may change or end this program, with reasonable notice. Commission already earned is still paid.",
      "Taking part is voluntary. You won't be disadvantaged in your job if you'd rather not.",
    ],
  },
];
