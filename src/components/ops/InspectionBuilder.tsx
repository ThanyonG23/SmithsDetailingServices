"use client";

import { useState, useTransition } from "react";
import { EXTRA_PRESETS } from "@/lib/ops/config";
import { saveInspection, uploadInspectionPhotoAction, markInspectionMember } from "@/app/ops/actions";
import type { InspectionItem } from "@/lib/ops/db";

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");

/* Resize a phone photo down to a sane size before upload (keeps payloads small
   and pages fast). Returns a JPEG data URL. */
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

export default function InspectionBuilder({
  slug,
  initialItems,
  status,
  initialMember,
}: {
  slug: string;
  initialItems: InspectionItem[];
  status: string;
  initialMember: boolean;
}) {
  const [items, setItems] = useState<InspectionItem[]>(initialItems);
  const [member, setMember] = useState(initialMember);
  const [, startMember] = useTransition();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? `${window.location.origin}/v/${slug}` : `/v/${slug}`;

  async function persist(next: InspectionItem[]) {
    setItems(next);
    try {
      await saveInspection(slug, next);
    } catch {
      setErr("Couldn't save, check your connection.");
    }
  }

  async function onFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    setErr(null);
    try {
      for (const file of Array.from(files)) {
        const dataUrl = await resize(file);
        const publicUrl = await uploadInspectionPhotoAction(slug, dataUrl);
        setPhotos((p) => [...p, publicUrl]);
      }
    } catch (e) {
      setErr(
        e instanceof Error && e.message.includes("storage-not-configured")
          ? "Photo storage isn't set up yet, add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel."
          : "Photo upload failed, try again."
      );
    } finally {
      setBusy(false);
    }
  }

  function pickPreset(p: { title: string; price: number; description: string }) {
    setTitle(p.title);
    setDesc(p.description);
    // price intentionally left for you to set per car
  }

  function addItem() {
    if (!title.trim()) {
      setErr("Give the extra a name first.");
      return;
    }
    const item: InspectionItem = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: desc.trim(),
      price: Number(price) || 0,
      photos,
    };
    persist([...items, item]);
    setTitle("");
    setDesc("");
    setPrice("");
    setPhotos([]);
    setErr(null);
  }

  function removeItem(id: string) {
    persist(items.filter((i) => i.id !== id));
  }

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  const total = items.reduce((a, i) => a + i.price, 0);

  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* member discount toggle */}
      <button
        type="button"
        onClick={() => {
          const v = !member;
          setMember(v);
          startMember(() => markInspectionMember(slug, v));
        }}
        className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
          member ? "border-brand-green/50 bg-brand-green/[0.06]" : "border-white/12 bg-white/[0.02]"
        }`}
      >
        <div>
          <div className="text-sm font-bold text-white">Smiths Garage member</div>
          <div className="text-xs text-white/50">
            {member ? "Customer sees 10% off every upsell" : "Turn on to give this customer the member discount"}
          </div>
        </div>
        <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${member ? "bg-brand-green" : "bg-white/15"}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${member ? "left-[22px]" : "left-0.5"}`} />
        </span>
      </button>

      {/* the shareable link */}
      <div className={`${CARD} p-4`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
          Customer link
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-brand-green">
            {url}
          </code>
          <button
            onClick={copyLink}
            className="shrink-0 rounded-full bg-brand-green px-4 py-2 text-xs font-black text-[#04130a] transition hover:brightness-110 active:scale-95"
          >
            {copied ? "Copied ✓" : "Copy link"}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/70 transition hover:border-white/35 hover:text-white"
          >
            Preview
          </a>
        </div>
        <p className="mt-2 text-[11px] text-white/40">
          {status === "responded"
            ? "The customer has already replied, see their picks on the Inspect page."
            : "Send this to the customer once you've added the extras below. Add photos and they'll tick what they want."}
        </p>
      </div>

      {/* existing items */}
      {items.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
              Extras added ({items.length})
            </div>
            <div className="text-sm font-bold text-white/70">
              Total <span className="text-brand-green">{money(total)}</span>
            </div>
          </div>
          {items.map((it) => (
            <div key={it.id} className={`${CARD} p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display text-base font-extrabold tracking-tight text-white">
                    {it.title}
                  </div>
                  {it.description && <div className="mt-0.5 text-xs text-white/55">{it.description}</div>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-display text-lg font-extrabold tabular-nums text-brand-green">
                    {money(it.price)}
                  </span>
                  <button
                    onClick={() => removeItem(it.id)}
                    aria-label="Remove extra"
                    className="text-sm font-bold text-white/25 transition hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              </div>
              {it.photos.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {it.photos.map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={p} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* add a new extra */}
      <div className={`${CARD} p-5`}>
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
          Add an extra
        </div>

        {/* preset quick-picks */}
        <div className="mt-3 flex flex-wrap gap-2">
          {EXTRA_PRESETS.map((p) => (
            <button
              key={p.title}
              onClick={() => pickPreset(p)}
              className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-white/70 transition hover:border-brand-green hover:text-brand-green"
            >
              {p.title}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_130px]">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Extra name (e.g. Headlight Restoration)"
            className={INPUT}
          />
          <div className="flex items-center rounded-lg border border-white/12 bg-black/40 focus-within:border-brand-green">
            <span className="pl-3 font-semibold text-white/35">$</span>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              min={0}
              inputMode="decimal"
              placeholder="0"
              className="w-full bg-transparent px-2 py-2.5 text-sm text-white outline-none"
            />
          </div>
        </div>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          placeholder="Short description the customer will read…"
          className={`${INPUT} mt-3 resize-y`}
        />

        {/* photo capture */}
        <div className="mt-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-white/75 transition hover:border-brand-green hover:text-brand-green">
            📷 {busy ? "Uploading…" : "Add photos"}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              disabled={busy}
              onChange={(e) => onFiles(e.target.files)}
              className="hidden"
            />
          </label>
          {photos.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {photos.map((p, i) => (
                <div key={i} className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  <button
                    onClick={() => setPhotos((ph) => ph.filter((_, idx) => idx !== i))}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                    aria-label="Remove photo"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {err && <div className="mt-3 text-xs font-semibold text-red-300">{err}</div>}

        <button
          onClick={addItem}
          disabled={busy}
          className="mt-4 rounded-full bg-brand-green px-6 py-2.5 text-xs font-black text-[#04130a] transition hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          + Add this extra
        </button>
      </div>
    </div>
  );
}
