/* Waitlist pipeline stages, a plain module (no "use client") so both the
   server page and the client controls can import it. */

export const WAITLIST_STAGES: { value: string; label: string }[] = [
  { value: "pending", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "member", label: "Member" },
  { value: "passed", label: "Passed" },
];

/** Normalise a stored status (incl. the legacy "actioned") to a known stage. */
export function stageOf(status: string): string {
  if (status === "actioned") return "contacted";
  return WAITLIST_STAGES.some((s) => s.value === status) ? status : "pending";
}
