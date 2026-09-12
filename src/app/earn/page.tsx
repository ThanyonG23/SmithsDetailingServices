import type { Metadata } from "next";
import EarnLanding from "@/components/EarnLanding";

export const metadata: Metadata = {
  title: "Get paid to share Smiths | Partner Program",
  description:
    "Earn 25% recurring for every member you refer to the Smiths giveaway, for as long as they stay. Free to join, get your link in seconds.",
  alternates: { canonical: "/earn" },
};

export default function EarnPage() {
  return <EarnLanding />;
}
