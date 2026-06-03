"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  VEHICLES,
  PACKAGES,
  EXTRAS,
  SLOTS,
  BUSINESS,
  money,
  extraPrice,
  basePrice,
  type VehicleKey,
  type PackageKey,
} from "@/lib/config";
import { todayInCairns } from "@/lib/time";

type SlotState = { available: boolean; blockedByRule: boolean };

function captureAttribution(): Record<string, string> {
  try {
    const p = new URLSearchParams(window.location.search);
    const get = (k: string) => p.get(k) || "";
    return {
      gclid: get("gclid"),
      utm_source: get("utm_source"),
      utm_medium: get("utm_medium"),
      utm_campaign: get("utm_campaign"),
      landing_url: window.location.href,
      referrer: document.referrer || "",
    };
  } catch {
    return {};
  }
}

export default function BookingFlow() {
  const router = useRouter();

  const [vehicle, setVehicle] = useState<VehicleKey | "">("");
  const [pkgKey, setPkgKey] = useState<PackageKey | "">("");
  const [extras, setExtras] = useState<Set<string>>(new Set());
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<"0700" | "1130" | "">("");

  const [avail, setAvail] = useState<Record<string, SlotState> | null>(null);
  const [availLoading, setAvailLoading] = useState(false);
  const [availMsg, setAvailMsg] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const pkg = useMemo(() => PACKAGES.find((p) => p.key === pkgKey), [pkgKey]);
  const minDate = useMemo(() => todayInCairns(), []);

  // ---- live pricing ----
  const base = pkg && vehicle ? basePrice(pkg, vehicle) : 0;
  const extraAllowed = (onlyFor?: PackageKey[]) =>
    !onlyFor || (!!pkgKey && onlyFor.includes(pkgKey as PackageKey));

  const pricedExtras = useMemo(() => {
    if (!vehicle) return [];
    return EXTRAS.filter((e) => extras.has(e.key) && extraAllowed(e.onlyFor)).map((e) => ({
      key: e.key,
      label: e.label,
      price: extraPrice(e, vehicle as VehicleKey),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extras, vehicle, pkgKey]);
  const extrasTotal = pricedExtras.reduce((s, x) => s + x.price, 0);
  const total = base + extrasTotal;

  // ---- 7am-only rule: drop the late slot if package requires it ----
  useEffect(() => {
    if (pkg?.sevenAmOnly && slot === "1130") setSlot("0700");
  }, [pkg, slot]);

  // ---- drop any selected extras not allowed for the chosen package ----
  useEffect(() => {
    setExtras((prev) => {
      let changed = false;
      const next = new Set(prev);
      EXTRAS.forEach((e) => {
        const allowed = !e.onlyFor || (!!pkgKey && e.onlyFor.includes(pkgKey as PackageKey));
        if (!allowed && next.has(e.key)) {
          next.delete(e.key);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [pkgKey]);

  // ---- fetch availability when vehicle + package + date are all chosen ----
  const refreshAvailability = useCallback(async () => {
    if (!vehicle || !pkgKey || !date) {
      setAvail(null);
      setAvailMsg("");
      return;
    }
    setAvailLoading(true);
    setAvailMsg("Checking availability…");
    try {
      const res = await fetch(
        `/api/availability?date=${encodeURIComponent(date)}&package=${encodeURIComponent(pkgKey)}`
      );
      const data = await res.json();
      if (data?.ok && Array.isArray(data.slots)) {
        const map: Record<string, SlotState> = {};
        data.slots.forEach((s: { key: string; available: boolean; blockedByRule: boolean }) => {
          map[s.key] = { available: s.available, blockedByRule: s.blockedByRule };
        });
        setAvail(map);
        // if currently selected slot is no longer available, clear it
        if (slot && !map[slot]?.available) setSlot("");
        setAvailMsg("");
      } else {
        setAvail(null);
        setAvailMsg("Couldn't check availability — you can still submit and we'll confirm.");
      }
    } catch {
      setAvail(null);
      setAvailMsg("Couldn't check availability — you can still submit and we'll confirm.");
    } finally {
      setAvailLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle, pkgKey, date]);

  useEffect(() => {
    const t = setTimeout(refreshAvailability, 250);
    return () => clearTimeout(t);
  }, [refreshAvailability]);

  function toggleExtra(key: string) {
    setExtras((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function slotDisabled(key: "0700" | "1130"): boolean {
    if (pkg?.sevenAmOnly && key !== "0700") return true;
    if (avail) return !avail[key]?.available;
    return false;
  }

  async function submit() {
    setError("");
    if (!vehicle) return setError("Please choose your vehicle type.");
    if (!pkgKey) return setError("Please choose a package.");
    if (!date) return setError("Please choose a date.");
    if (!slot) return setError("Please choose a time.");
    if (!name.trim()) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return setError("Please enter a valid email.");
    if (!phone.trim()) return setError("Please enter your phone number.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle,
          package: pkgKey,
          date,
          slot,
          extras: Array.from(extras),
          customer: { name, email, phone, notes },
          attribution: captureAttribution(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Something went wrong. Please try again or text us.");
        setSubmitting(false);
        return;
      }
      router.push(`/thank-you?id=${encodeURIComponent(data.bookingId)}`);
    } catch {
      setError("Booking failed to send. Please try again or text us.");
      setSubmitting(false);
    }
  }

  const Step = ({ n, title }: { n: number; title: string }) => (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-yellow text-sm font-extrabold text-black">
        {n}
      </span>
      <h2 className="text-lg font-extrabold tracking-tight text-white">{title}</h2>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 pb-40 pt-8 sm:px-8">
      <a
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white"
      >
        ← Back to home
      </a>

      <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
        Book your detail
      </h1>
      <p className="mt-2 text-sm text-white/70">
        All detailing is done at our {BUSINESS.suburb} workshop — drop-off &amp; pick-up. Pick your
        options below; no payment now, you pay on the day.
      </p>

      {/* 1. VEHICLE */}
      <section className="mt-10">
        <Step n={1} title="Your vehicle" />
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          {VEHICLES.map((v) => {
            const selected = vehicle === v.key;
            return (
              <button
                key={v.key}
                type="button"
                onClick={() => setVehicle(v.key)}
                className={`relative aspect-[4/5] w-60 flex-none snap-start overflow-hidden rounded-2xl border text-left transition ${
                  selected ? "border-brand-yellow shadow-glowY" : "border-white/12"
                }`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${v.image})` }}
                  aria-hidden
                />
                <div
                  className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/55 to-black/90"
                  aria-hidden
                />
                {selected && (
                  <div className="absolute right-2 top-2 rounded-full bg-brand-yellow px-2 py-0.5 text-[11px] font-black text-black">
                    ✓
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <div className="font-extrabold leading-tight text-white">{v.label}</div>
                  <div className="mt-0.5 text-[11px] text-white/65">{v.hint}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. PACKAGE */}
      <section className="mt-10">
        <Step n={2} title="Your package" />
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          {PACKAGES.map((p) => {
            const price = vehicle ? p.prices[vehicle as VehicleKey] : null;
            const selected = pkgKey === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setPkgKey(p.key)}
                className={`relative aspect-[4/5] w-60 flex-none snap-start overflow-hidden rounded-2xl border text-left transition ${
                  selected ? "border-brand-green shadow-glowG" : "border-white/12"
                }`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${p.image})` }}
                  aria-hidden
                />
                <div
                  className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/60 to-black/90"
                  aria-hidden
                />
                <div className="absolute right-2 top-2 rounded-lg border border-brand-green/30 bg-black/55 px-2.5 py-1 text-sm font-black text-brand-green backdrop-blur">
                  {price != null ? money(price) : "Pick vehicle"}
                </div>
                {selected && (
                  <div className="absolute left-2 top-2 rounded-full bg-brand-green px-2 py-0.5 text-[11px] font-black text-[#04130a]">
                    ✓
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <div className="font-extrabold leading-tight text-white">{p.name}</div>
                  <div className="mt-1 text-[11px] font-bold text-brand-yellow">
                    ⏱ {p.durationLabel}
                    {p.sevenAmOnly ? " • 7AM only" : ""}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {!vehicle && (
          <p className="mt-2 text-xs text-white/45">Choose a vehicle above to see prices.</p>
        )}
      </section>

      {/* 3. EXTRAS */}
      <section className="mt-10">
        <Step n={3} title="Add extras (optional)" />
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          {EXTRAS.filter((e) => extraAllowed(e.onlyFor)).map((e) => {
            const price = vehicle ? extraPrice(e, vehicle as VehicleKey) : null;
            const on = extras.has(e.key);
            return (
              <button
                key={e.key}
                type="button"
                onClick={() => toggleExtra(e.key)}
                className={`relative aspect-[4/5] w-60 flex-none snap-start overflow-hidden rounded-2xl border text-left transition ${
                  on ? "border-brand-green shadow-glowG" : "border-white/12"
                }`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${e.image})` }}
                  aria-hidden
                />
                <div
                  className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/55 to-black/90"
                  aria-hidden
                />
                {price != null && (
                  <div className="absolute right-2 top-2 rounded-full border border-brand-green/30 bg-black/55 px-2 py-0.5 text-xs font-black text-brand-green backdrop-blur">
                    +{money(price)}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <div className="font-extrabold leading-tight text-white">{e.label}</div>
                  <div
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      on ? "bg-brand-green/25 text-brand-green" : "bg-white/15 text-white/75"
                    }`}
                  >
                    {on ? "Added ✓" : "Tap to add"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. DATE + TIME */}
      <section className="mt-10">
        <Step n={4} title="Date & time" />
        <input
          type="date"
          min={minDate}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-2xl border border-white/14 bg-white px-4 py-3 font-bold text-black"
        />

        <div className="mt-3 grid grid-cols-2 gap-3">
          {SLOTS.map((s) => {
            const disabled = slotDisabled(s.key);
            const selected = slot === s.key;
            return (
              <button
                key={s.key}
                type="button"
                disabled={disabled}
                onClick={() => setSlot(s.key)}
                className={`rounded-2xl border py-3 font-extrabold transition ${
                  selected
                    ? "border-brand-yellow bg-brand-yellow/10 text-white shadow-glowY"
                    : disabled
                    ? "cursor-not-allowed border-white/8 bg-white/[0.02] text-white/30"
                    : "border-white/14 bg-white/[0.03] text-white hover:border-white/25"
                }`}
              >
                {s.label}
                {disabled && !pkg?.sevenAmOnly && (
                  <span className="block text-[10px] font-semibold text-white/35">Booked</span>
                )}
                {disabled && pkg?.sevenAmOnly && s.key === "1130" && (
                  <span className="block text-[10px] font-semibold text-white/35">
                    Full-day job
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {(availLoading || availMsg) && (
          <p className="mt-3 text-xs font-semibold text-white/60">
            {availLoading ? "Checking availability…" : availMsg}
          </p>
        )}
        {!date && <p className="mt-2 text-xs text-white/45">Pick a date to see available times.</p>}
      </section>

      {/* 5. DETAILS */}
      <section className="mt-10">
        <Step n={5} title="Your details" />
        <div className="grid grid-cols-1 gap-3">
          <Field label="Full name">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Phone">
              <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="0456 186 696" />
            </Field>
            <Field label="Email">
              <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" placeholder="you@email.com" />
            </Field>
          </div>
          <Field label="Notes (optional)">
            <textarea className={`${inputCls} min-h-[90px]`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything we should know? Heavy pet hair, gates, parking, etc." />
          </Field>
        </div>
      </section>

      {/* GUARANTEE */}
      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-brand-green/30 bg-brand-green/[0.06] p-4">
        <div className="text-2xl">💯</div>
        <div className="text-sm font-bold text-brand-green">
          If you&apos;re not happy, you don&apos;t pay.
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
          {error}
        </div>
      )}

      {/* STICKY SUMMARY BAR */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-8">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-white/55">
              {pkg && vehicle ? `${pkg.name} • ${vehicle}` : "Select your options"}
            </div>
            <div className="text-xl font-black text-white">
              {total > 0 ? money(total) : "—"}
              {extrasTotal > 0 && (
                <span className="ml-2 text-xs font-semibold text-brand-green">
                  incl. {money(extrasTotal)} extras
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="shrink-0 rounded-xl bg-brand-green px-6 py-3 font-black text-[#04130a] shadow-glowG transition active:scale-95 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Confirm booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-white/14 bg-black/40 px-4 py-3 text-sm font-semibold text-white placeholder:text-white/40 outline-none focus:border-brand-green/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-white/85">{label}</span>
      {children}
    </label>
  );
}
