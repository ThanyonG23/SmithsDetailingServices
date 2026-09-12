import { requireOwner } from "@/lib/ops/auth";
import OutreachTool from "@/components/ops/OutreachTool";

export const dynamic = "force-dynamic";

export default function OutreachPage() {
  requireOwner();
  return <OutreachTool />;
}
