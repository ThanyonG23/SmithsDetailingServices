import type { Metadata } from "next";
import MembershipContent from "@/components/MembershipContent";

export const metadata: Metadata = {
  title: "The Smiths Detailing Membership | Cairns",
  description:
    "Keep your car detailed and serviced on a schedule with the Smiths Detailing membership. Cairns.",
  robots: { index: false, follow: false }, // sent direct to customers, not for search
  alternates: { canonical: "/plan" },
};

export default function PlanPage() {
  return <MembershipContent />;
}
