import type { Metadata } from "next";
import LandingHub from "@/components/LandingHub";

export const metadata: Metadata = {
  title: "Smiths, Detailing & Membership | Cairns",
  description:
    "Everything your car needs in one place in Cairns, premium detailing and a membership that keeps your car detailed and serviced on a schedule.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <LandingHub />;
}
