import { requireOwner } from "@/lib/ops/auth";
import { loadSmsData } from "./actions";
import SmsBlaster from "@/components/ops/SmsBlaster";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export default async function OpsSmsPage() {
  requireOwner();
  let initial;
  try {
    initial = await loadSmsData();
  } catch {
    initial = { recipients: [], stats: { contactable: 0, unsubscribed: 0, sentToday: 0 }, unsubs: [] };
  }
  return <SmsBlaster initial={initial} />;
}
