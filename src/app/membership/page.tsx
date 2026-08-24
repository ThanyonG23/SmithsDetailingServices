import type { Metadata } from "next";
import MembershipContent from "@/components/MembershipContent";

export const metadata: Metadata = {
  title: "The Smiths Detailing Membership | Cairns",
  description:
    "Hand us the keys and we'll keep your car detailed and serviced on a schedule, from $49/week. Founding memberships from Smiths Detailing, Cairns, for people who'd rather not think about their car.",
  robots: { index: false, follow: false }, // paid-ad landing page, not for search
  alternates: { canonical: "/membership" },
};

// New / cold audience, show the free cut & polish bonus.
export default function MembershipPage() {
  return <MembershipContent bonus />;
}
