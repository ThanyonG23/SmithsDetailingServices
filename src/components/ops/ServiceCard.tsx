"use client";

import { useRef, useState } from "react";
import { saveService, uploadServicePhotoAction } from "@/app/ops/actions";
import { STATE_META, type ServiceChecklistItem, type ServiceItemState } from "@/lib/ops/service";
import type { ServiceJob } from "@/lib/ops/db";

/* Resize a phone photo before upload (same as the inspection builder). */
function resize(file: File, maxDim = 1400, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const s = maxDim / Math.max(width, height);
          width = Math.round(width * s);
          height = Math.round(height * s);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no-canvas"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";
const INPUT =
  "w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-green";
const LABEL = "mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-white/40";
const STATES: ServiceItemState[] = ["ok", "attention", "urgent", "na"];

export default function ServiceCard({ initial }: { initial: ServiceJob }) {
  const [job, setJob] = useState<ServiceJob>(initial);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [uploading, setUploading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const url =
    typeof window !== "undefined" ? `${window.location.origin}/s/${job.slug}` : `/s/${job.slug}`;

  function save(next: ServiceJob) {
    setJob(next);
    setSaveState("saving");
    const { slug, created_at, ...rest } = next; // eslint-disable-line @typescript-eslint/no-unused-vars
    saveService(next.slug, rest)
      .then(() => {
        setSaveState("saved");
        setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1400);
      })
      .catch(() => setSaveState("idle"));
  }

  // debounce text-field saves so we're not hitting the DB per keystroke
  function saveSoon(next: ServiceJob) {
    setJob(next);
    setSaveState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => save(next), 700);
  }

  function patchField<K extends keyof ServiceJob>(k: K, v: ServiceJob[K]) {
    saveSoon({ ...job, [k]: v });
  }

  function patchItem(key: string, patch: Partial<ServiceChecklistItem>, immediate = false) {
    const checklist = job.checklist.map((it) => (it.key === key ? { ...it, ...patch } : it));
    const next = { ...job, checklist };
    immediate ? save(next) : saveSoon(next);
  }

  async function addPhoto(key: string, files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(key);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const dataUrl = await resize(file);
        urls.push(await uploadServicePhotoAction(job.slug, dataUrl));
      }
      const item = job.checklist.find((i) => i.key === key);
      patchItem(key, { photos: [...(item?.photos || []), ...urls] }, true);
    } catch {
      /* ignore — a failed photo shouldn't lose the card */
    } finally {
      setUploading(null);
    }
  }

  const done = job.checklist.filter((i) => i.state !== "pending").length;
  const flags = job.checklist.filter((i) => i.state === "attention" || i.state === "urgent").length;
  const completed = job.status === "completed";

  return (
    <div className="mt-5 flex flex-col gap-5">
      {/* save status + customer link */}
      <div className={`${CARD} flex flex-wrap items-center gap-2 p-3`}>
        <span className="text-[11px] font-semibold text-white/50">
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : `${done}/${job.checklist.length} checked`}
          {flags > 0 && <span className="text-brand-yellow"> · {flags} to action</span>}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}
            className="rounded-full bg-brand-green px-3.5 py-1.5 text-[11px] font-black text-[#04130a] transition hover:brightness-110"
          >
            {copied ? "Copied ✓" : "Copy customer link"}
          </button>
          <a href={url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-bold text-white/70 hover:text-white">
            Preview
          </a>
        </div>
      </div>

      {/* vehicle / customer header */}
      <div className={`${CARD} p-4`}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className={LABEL}>Rego</label><input className={INPUT} value={job.rego} onChange={(e) => patchField("rego", e.target.value.toUpperCase())} placeholder="ABC123" /></div>
          <div><label className={LABEL}>Odometer (km)</label><input className={INPUT} value={job.odometer} onChange={(e) => patchField("odometer", e.target.value)} placeholder="128500" inputMode="numeric" /></div>
          <div><label className={LABEL}>Vehicle</label><input className={INPUT} value={job.vehicle} onChange={(e) => patchField("vehicle", e.target.value)} placeholder="2009 Toyota Prado" /></div>
          <div><label className={LABEL}>Customer</label><input className={INPUT} value={job.customer_name} onChange={(e) => patchField("customer_name", e.target.value)} placeholder="Name" /></div>
          <div><label className={LABEL}>Technician</label><input className={INPUT} value={job.technician} onChange={(e) => patchField("technician", e.target.value)} placeholder="Who did the work" /></div>
          <div><label className={LABEL}>Next service due</label><input className={INPUT} value={job.next_service} onChange={(e) => patchField("next_service", e.target.value)} placeholder="e.g. 138,500 km or in 6 months" /></div>
        </div>
      </div>

      {/* checklist */}
      <div className="flex flex-col gap-3">
        {job.checklist.map((it) => {
          const meta = STATE_META[it.state];
          return (
            <div key={it.key} className={`${CARD} p-4`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} />
                  <span className="font-display text-base font-extrabold tracking-tight text-white">{it.label}</span>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {STATES.map((s) => (
                    <button
                      key={s}
                      onClick={() => patchItem(it.key, { state: it.state === s ? "pending" : s }, true)}
                      className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                        it.state === s ? STATE_META[s].badge : "bg-white/[0.03] text-white/40 hover:text-white/70"
                      }`}
                    >
                      {STATE_META[s].label}
                    </button>
                  ))}
                </div>
              </div>
              <input
                className={`${INPUT} mt-3`}
                value={it.detail}
                onChange={(e) => patchItem(it.key, { detail: e.target.value })}
                placeholder={it.hint}
              />
              <div className="mt-2 flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-3 py-1.5 text-[11px] font-bold text-white/70 transition hover:border-brand-green hover:text-brand-green">
                  📷 {uploading === it.key ? "Uploading…" : "Photo"}
                  <input type="file" accept="image/*" capture="environment" multiple disabled={uploading === it.key} onChange={(e) => addPhoto(it.key, e.target.files)} className="hidden" />
                </label>
                {it.photos.length > 0 && (
                  <div className="flex gap-1.5 overflow-x-auto">
                    {it.photos.map((p, i) => (
                      <div key={i} className="relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p} alt="" className="h-14 w-14 rounded-lg object-cover" />
                        <button
                          onClick={() => patchItem(it.key, { photos: it.photos.filter((_, idx) => idx !== i) }, true)}
                          className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
                          aria-label="Remove photo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* notes */}
      <div className={`${CARD} p-4`}>
        <label className={LABEL}>Notes for the customer report</label>
        <textarea className={`${INPUT} min-h-[80px] resize-y`} value={job.notes} onChange={(e) => patchField("notes", e.target.value)} placeholder="Anything worth noting — recommendations, work done, follow-ups…" />
      </div>

      {/* complete */}
      <button
        onClick={() => save({ ...job, status: completed ? "in_progress" : "completed" })}
        className={`rounded-full px-6 py-4 font-display text-base font-extrabold transition active:scale-95 ${
          completed ? "border border-white/15 text-white/70 hover:text-white" : "bg-brand-green text-[#04130a] hover:brightness-110"
        }`}
      >
        {completed ? "✓ Completed — tap to reopen" : "Mark service complete"}
      </button>
      <p className="text-center text-[11px] text-white/35">Everything saves automatically as you go. Copy the link up top to send the customer their report.</p>
    </div>
  );
}
