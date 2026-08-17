import type { Metadata } from "next";
import MembershipContent from "@/components/MembershipContent";

export const metadata: Metadata = {
  title: "Smiths Garage Maintenance | Cairns",
  description:
    "Hand us the keys and we'll keep your car clean and serviced on a schedule. A membership from Smiths Garage, Cairns, for people who'd rather not think about their car.",
  robots: { index: false, follow: false }, // sent direct to customers — not for search
  alternates: { canonical: "/membership" },
};

// New / cold audience — show the free cut & polish bonus.
export default function MembershipPage() {
  return <MembershipContent bonus />;
}
