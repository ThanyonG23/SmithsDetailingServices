import type { Metadata } from "next";
import AffiliateDashboard from "@/components/AffiliateDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your affiliate dashboard | Smiths",
  robots: { index: false, follow: false },
};

export default function AffiliateDashboardPage({ params }: { params: { code: string } }) {
  return <AffiliateDashboard code={params.code} />;
}
