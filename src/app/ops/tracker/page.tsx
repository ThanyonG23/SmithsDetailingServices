import { requireOwner } from "@/lib/ops/auth";
import GrindTracker from "@/components/ops/GrindTracker";

export const dynamic = "force-dynamic";

export default function TrackerPage() {
  requireOwner();
  return <GrindTracker />;
}
