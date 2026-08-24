import { requireOwner } from "@/lib/ops/auth";
import LiveDraw from "@/components/ops/LiveDraw";

export const dynamic = "force-dynamic";

export default function OpsDrawPage() {
  requireOwner();
  return <LiveDraw />;
}
