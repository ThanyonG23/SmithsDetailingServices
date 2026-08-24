import type { Metadata } from "next";
import HomeContent from "@/components/HomeContent";

export const metadata: Metadata = {
  title: "Premium Car Detailing in Cairns | Smiths Detailing",
  description:
    "Premium car detailing in Cairns. Deep interior cleans, cut & polish, multi-stage paint correction, headlight restoration and ceramic coatings. Text us for a free quote. If you're not happy, you don't pay.",
  alternates: { canonical: "/detailing" },
  openGraph: {
    title: "Premium Car Detailing in Cairns | Smiths Detailing",
    description:
      "Deep interior cleans, cut & polish, paint correction and ceramic coatings in Cairns. Text us for a free quote. If you're not happy, you don't pay.",
    url: "/detailing",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Smiths Detailing, Cairns" }],
  },
};

export default function DetailingPage() {
  return <HomeContent />;
}
