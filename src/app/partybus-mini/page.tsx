import type { Metadata } from "next";
import PartyBusOffer from "@/components/PartyBusOffer";

/* Personalised proposal page for Ultimate Party Cairns, mini (1 week) giveaway. */

export const metadata: Metadata = {
  title: "Mini Giveaway for Ultimate Party Cairns | Smiths",
  description:
    "A one-week giveaway that puts Ultimate Party Cairns in front of our whole Cairns audience. You put up 2 free tickets, we do the rest.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/partybus-mini" },
};

export default function PartyBusMiniPage() {
  return (
    <PartyBusOffer
      badge="Mini giveaway"
      headline={
        <>
          Let&apos;s fill your bus, <span className="text-brand-purple-soft">on us.</span>
        </>
      }
      sub="A one-week giveaway that puts Ultimate Party Cairns in front of our whole Cairns audience, across every platform. You don't pay a cent, you just put up the prize."
      give={[
        { t: "A full week of content", d: "filmed with you and posted across TikTok, Instagram, Facebook and YouTube." },
        { t: "Tagged in every post", d: "your business tagged and credited in every single piece." },
        { t: "Featured on our website", d: "showcased with a direct link straight to your booking site." },
        { t: "Pushed to our members", d: "the giveaway promoted to our growing local Cairns audience." },
      ]}
      putUp="2 free tickets on your party bus, for us to raffle off to our audience."
      memberOffer="Our members get 10% off your services."
      valueLine={
        <>
          A week of content across four platforms would cost you <span className="font-black text-white">$500+</span> from
          an agency. Here it costs you nothing but the prize.
        </>
      }
      source="partybus-mini"
      offerLabel="Ultimate Party Cairns, MINI giveaway (1 week content, prize: 2 free tickets)"
      ctaLabel="Lock in my week →"
    />
  );
}
