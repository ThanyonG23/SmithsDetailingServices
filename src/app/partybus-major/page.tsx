import type { Metadata } from "next";
import PartyBusOffer from "@/components/PartyBusOffer";

/* Personalised proposal page for Ultimate Party Cairns, major (1 month) giveaway,
   anchored to the Christmas Lights Tour season. */

export const metadata: Metadata = {
  title: "Major Giveaway for Ultimate Party Cairns | Smiths",
  description:
    "A full month promoting Ultimate Party Cairns, anchored to your Christmas Lights Tour season. 1 reel and 2 stories a day for a month. You put up the prize, we do the rest.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/partybus-major" },
};

export default function PartyBusMajorPage() {
  return (
    <PartyBusOffer
      badge="Major giveaway"
      headline={
        <>
          A month of content. A packed bus.
          <br />
          <span className="text-brand-purple-soft">Zero cost to you.</span>
        </>
      }
      sub="Our flagship giveaway: a full month promoting Ultimate Party Cairns, anchored to your Christmas Lights Tour season, in front of our entire Cairns audience."
      give={[
        { t: "A full month of content", d: "1 reel and 2 stories every single day, for a month straight." },
        { t: "Across every platform", d: "TikTok, Instagram, Facebook and YouTube." },
        { t: "Tagged and linked every time", d: "your business in every piece, with a link to your booking site." },
        { t: "Featured on our website", d: "showcased for the full month with a direct link." },
        { t: "Promoted to our members", d: "the giveaway pushed hard to our growing local audience." },
      ]}
      putUp="A $500 party bus hire, bring 10 mates, run as a Christmas Lights Tour for the winner and their crew."
      memberOffer="Our members get 10% off your services."
      bonus="a batch of the filmed footage handed over for you to use on your own socials."
      valueLine={
        <>
          A month of daily reels and stories from a content agency runs{" "}
          <span className="font-black text-white">$2,000 to $5,000</span>. Here it costs you nothing but the prize.
        </>
      }
      note="We've anchored this to your Christmas Lights Tour for the season, but the theme and the prize are yours to shape. We'll run whatever you'd most like to give away."
      source="partybus-major"
      offerLabel="Ultimate Party Cairns, MAJOR giveaway (1 month content, Christmas Lights Tour, prize: $500 party bus hire for 10)"
      ctaLabel="Lock in the month →"
    />
  );
}
