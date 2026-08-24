/* =====================================================================
   SMITHS GARAGE, service job card
   ---------------------------------------------------------------------
   A plain module (no server code) shared by the DB layer, the ops
   builder and the public customer report. Defines the service/inspection
   checklist template and its types.
   ===================================================================== */

export type ServiceItemState = "pending" | "ok" | "attention" | "urgent" | "na";

export interface ServiceChecklistItem {
  key: string;
  label: string;
  hint: string;
  state: ServiceItemState;
  detail: string;
  photos: string[];
}

/* The default service + inspection sheet. `hint` is the prompt shown to
   whoever fills it out; `detail` is what they type in per car. */
export const SERVICE_TEMPLATE: { key: string; label: string; hint: string }[] = [
  { key: "oil_change", label: "Oil change", hint: "Oil type & quantity (e.g. 5W-30, 4.5L)" },
  { key: "oil_filter", label: "Oil filter", hint: "Replaced · part number" },
  { key: "air_filter", label: "Air filter", hint: "Checked, blown out or replaced" },
  { key: "cabin_filter", label: "Cabin filter", hint: "Checked / replaced" },
  { key: "brakes", label: "Brakes", hint: "Front & rear pad life" },
  { key: "tyres", label: "Tyres", hint: "Tread depth & pressures" },
  { key: "battery", label: "Battery", hint: "Voltage / health" },
  { key: "fluids", label: "Fluids", hint: "Coolant, brake & washer topped up" },
  { key: "lights", label: "Lights", hint: "All globes working" },
  { key: "wipers", label: "Wiper blades", hint: "Checked / swapped" },
  { key: "suspension", label: "Suspension & steering", hint: "Visual check for wear / leaks" },
  { key: "warnings", label: "Warning lights / scan", hint: "Dash lights, OBD scan result" },
  { key: "damage", label: "Exterior damage", hint: "Note & photograph any scratches / dents" },
];

export function freshChecklist(): ServiceChecklistItem[] {
  return SERVICE_TEMPLATE.map((t) => ({
    key: t.key,
    label: t.label,
    hint: t.hint,
    state: "pending",
    detail: "",
    photos: [],
  }));
}

export const STATE_META: Record<ServiceItemState, { label: string; badge: string; dot: string }> = {
  pending: { label: "-", badge: "bg-white/8 text-white/45", dot: "bg-white/25" },
  ok: { label: "OK", badge: "bg-brand-green/15 text-brand-green", dot: "bg-brand-green" },
  attention: { label: "Soon", badge: "bg-brand-yellow/15 text-brand-yellow", dot: "bg-brand-yellow" },
  urgent: { label: "Now", badge: "bg-red-500/15 text-red-300", dot: "bg-red-400" },
  na: { label: "N/A", badge: "bg-white/8 text-white/35", dot: "bg-white/20" },
};
