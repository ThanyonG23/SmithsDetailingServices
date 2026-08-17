import type { Metadata } from "next";
import MembershipContent from "@/components/MembershipContent";

export const metadata: Metadata = {
  title: "Smiths Garage Maintenance | Cairns",
  description:
    "Keep your car clean and serviced on a schedule with the Smiths Garage maintenance membership. Cairns.",
  robots: { index: false, follow: false }, // sent direct to customers — not for search
  alternates: { canonical: "/plan" },
};

// Existing detail clients — no free cut & polish banner, so they don't feel
// they missed out on something they've effectively just had.
export default function PlanPage() {
  return <MembershipContent bonus={false} />;
}
