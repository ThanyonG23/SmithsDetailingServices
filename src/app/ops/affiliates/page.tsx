import { requireOwner } from "@/lib/ops/auth";
import AffiliatesTool from "@/components/ops/AffiliatesTool";

export const dynamic = "force-dynamic";

export default function AffiliatesPage() {
  requireOwner();
  return <AffiliatesTool />;
}
