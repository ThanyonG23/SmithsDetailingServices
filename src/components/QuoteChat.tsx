"use client";

import { useState } from "react";
import { BUSINESS } from "@/lib/config";
import { REF_STORAGE_KEY } from "@/lib/referrals";
import {
  PRIORITY_OPTIONS,
  VEHICLE_SIZES,
  buildQuote,
  type Priority,
  type PackageId,
  type QuoteResult,
  type VehicleSize,
} from "@/lib/packages";

type Step =
  | "vehicle"
  | "priorities"
  | "size"
  | "quote"
  | "slots"
  | "contact"
  | "done"
  | "declined";

interface Bubble {
  from: "bot" | "user";
  text: string;
  mono?: boolean;
}

interface Slot {
  date: string;
  slots: string[];
}

function storedReferralCode(): string {
  try {
    const raw = window.localStorage.getItem(REF_STORAGE_KEY);
    if (!raw) return "";
    const parsed = JSON.parse(raw) as { code?: string; exp?: number };
    if (!parsed?.code || Date.now() > (parsed.exp || 0)) return "";
    return parsed.code;
  } catch {
    return "";
  }
}

function dayLabel(d: string): string {
  return new Date(`${d}T00:00:00+10:00`).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Australia/Brisbane",
  });
}

function Bubbles({ items }: { items: Bubble[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((b, i) => (
        <div
          key={i}
          className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            b.from === "bot"
              ? "self-start border border-white/10 bg-white/[0.04] text-white/85"
              : "self-end bg-brand-green text-[#04130a] font-semibold"
          } ${b.mono ? "whitespace-pre-line" : ""}`}
        >
          {b.text}
        </div>
      ))}
    </div>
  );
}

export default function QuoteChat() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("vehicle");
  const [messages, setMessages] = useState<Bubble[]>([
    {
      from: "bot",
      text: "Hey! To provide a free quote, please send me the make and model of your vehicle.",
    },
  ]);
  const [vehicleText, setVehicleText] = useState("");
  const [vehicleInput, setVehicleInput] = useState("");
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [size, setSize] = useState<VehicleSize | null>(null);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [slotDays, setSlotDays] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [chosen, setChosen] = useState<{ date: string; slot: string } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setStep("vehicle");
    setMessages([
      {
        from: "bot",
        text: "Hey! To provide a free quote, please send me the make and model of your vehicle.",
      },
    ]);
    setVehicleText("");
    setVehicleInput("");
    setPriorities([]);
    setSize(null);
    setQuote(null);
    setSlotDays([]);
    setChosen(null);
    setName("");
    setEmail("");
    setPhone("");
    setError("");
  }

  function submitVehicle() {
    const v = vehicleInput.trim().slice(0, 100);
    if (!v) return;
    setVehicleText(v);
    setMessages((m) => [
      ...m,
      { from: "user", text: v },
      {
        from: "bot",
        text: `I can certainly help with your ${v}! Can you tap the ones that are a priority for you:`,
      },
    ]);
    setStep("priorities");
  }

  function togglePriority(id: Priority) {
    setPriorities((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  function submitPriorities() {
    if (priorities.length === 0) return;
    const labels = PRIORITY_OPTIONS.filter((o) => priorities.includes(o.id)).map((o) => o.label);
    setMessages((m) => [
      ...m,
      { from: "user", text: labels.join(", ") },
      { from: "bot", text: "Last thing — what type of vehicle is it?" },
    ]);
    setStep("size");
  }

  function submitSize(s: VehicleSize) {
    setSize(s);
    const q = buildQuote(priorities, s, vehicleText);
    setQuote(q);
    setMessages((m) => [
      ...m,
      { from: "user", text: s },
      { from: "bot", text: q.body, mono: true },
      { from: "bot", text: "Would you like to book this in?" },
    ]);
    setStep("quote");
  }

  function declineBooking() {
    setMessages((m) => [
      ...m,
      { from: "user", text: "Not right now" },
      {
        from: "bot",
        text: `No worries at all! Reach out anytime — call or text ${BUSINESS.phone}. Have a great day 🙂`,
      },
    ]);
    setStep("declined");
  }

  async function acceptBooking() {
    if (!quote || !size) return;
    setMessages((m) => [...m, { from: "user", text: "Yes, let's book it in" }]);
    setStep("slots");
    setLoadingSlots(true);
    try {
      const res = await fetch(
        `/api/quote/availability?package=${quote.packageId}&size=${encodeURIComponent(size)}`
      );
      const data = await res.json();
      let days: Slot[] = Array.isArray(data?.days) ? data.days : [];
      if (days.length === 0) {
        // Nothing free found — offer tomorrow anyway; Ashlee confirms the
        // real time when she calls, this is a request, not a lock-in.
        const tomorrow = new Date(Date.now() + 86400000);
        const iso = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Brisbane" }).format(
          tomorrow
        );
        days = [{ date: iso, slots: ["7:00am", "11:30am"] }];
      }
      setSlotDays(days);
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Great! Here's what we've got coming up — pick a day and time:" },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "bot", text: `Couldn't check the calendar just then — pop your details in and we'll text you a time.` },
      ]);
      setSlotDays([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  function pickSlot(date: string, slot: string) {
    setChosen({ date, slot });
    setMessages((m) => [
      ...m,
      { from: "user", text: `${dayLabel(date)} — ${slot}` },
      { from: "bot", text: "Great! I just need the following please:" },
    ]);
    setStep("contact");
  }

  async function submitContact() {
    if (!quote || !size) return;
    if (!name.trim() || (!email.trim() && !phone.trim())) {
      setError("Please add your name and either an email or phone number.");
      return;
    }
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/quote/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          vehicle_text: vehicleText,
          vehicle_size: size,
          priorities,
          package_id: quote.packageId as PackageId,
          requested_date: chosen?.date || "",
          requested_slot: chosen?.slot || "",
          referral_code: storedReferralCode(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Something went wrong — try again.");
        setSending(false);
        return;
      }
      setMessages((m) => [
        ...m,
        { from: "user", text: `${name} · ${email || phone}` },
        {
          from: "bot",
          text: `Thanks ${name.split(" ")[0]}! Your ${quote.title} request for your ${vehicleText} on ${dayLabel(
            chosen?.date || ""
          )} (${chosen?.slot}) is through to the team — we'll confirm shortly.\n\nAny questions, feel free to call or text ${BUSINESS.phone}.`,
        },
      ]);
      setStep("done");
    } catch {
      setError("Couldn't reach the server — try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  const textMeHref = quote
    ? "sms:" +
      BUSINESS.phoneE164 +
      "?&body=" +
      encodeURIComponent(`My quote from Smiths Detailing:\n\n${quote.body}`)
    : undefined;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-yellow/50 bg-brand-yellow/10 px-7 py-4 text-sm font-black text-brand-yellow transition hover:bg-brand-yellow/20 active:scale-95"
      >
        ⚡ Get an Instant Quote
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
          <div className="flex h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#0a0a0c] sm:h-[80vh] sm:rounded-3xl">
            {/* header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <div className="font-display text-base font-extrabold text-white">Instant Quote</div>
                <div className="text-xs text-white/45">Smiths Detailing · Cairns</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full border border-white/15 p-2 text-white/60 transition hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* transcript */}
            <div className="flex-1 overflow-y-auto px-4 py-5">
              <Bubbles items={messages} />
              {loadingSlots && (
                <div className="mt-2.5 max-w-[88%] rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/50">
                  Checking the calendar…
                </div>
              )}
            </div>

            {/* controls */}
            <div className="border-t border-white/10 bg-black/30 p-4">
              {step === "vehicle" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitVehicle();
                  }}
                  className="flex gap-2"
                >
                  <input
                    autoFocus
                    value={vehicleInput}
                    onChange={(e) => setVehicleInput(e.target.value)}
                    placeholder="e.g. Toyota Landcruiser"
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-brand-green"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-xl bg-brand-green px-4 py-3 text-sm font-black text-[#04130a] transition hover:brightness-110 active:scale-95"
                  >
                    →
                  </button>
                </form>
              )}

              {step === "priorities" && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {PRIORITY_OPTIONS.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => togglePriority(o.id)}
                        className={`rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                          priorities.includes(o.id)
                            ? "border-brand-green bg-brand-green/15 text-brand-green"
                            : "border-white/15 text-white/70 hover:border-white/30"
                        }`}
                      >
                        {priorities.includes(o.id) ? "✓ " : ""}
                        {o.label}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={priorities.length === 0}
                    onClick={submitPriorities}
                    className="rounded-xl bg-brand-green px-4 py-3 text-sm font-black text-[#04130a] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Continue
                  </button>
                </div>
              )}

              {step === "size" && (
                <div className="grid grid-cols-2 gap-2">
                  {VEHICLE_SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => submitSize(s)}
                      className="rounded-xl border border-white/15 px-3.5 py-3 text-sm font-bold text-white/80 transition hover:border-brand-green hover:text-brand-green"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {step === "quote" && (
                <div className="flex gap-2">
                  <button
                    onClick={acceptBooking}
                    className="flex-1 rounded-xl bg-brand-green px-4 py-3 text-sm font-black text-[#04130a] transition hover:brightness-110 active:scale-95"
                  >
                    Yes, book it in
                  </button>
                  <button
                    onClick={declineBooking}
                    className="rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white/70 transition hover:border-white/30"
                  >
                    Not yet
                  </button>
                </div>
              )}

              {step === "slots" && !loadingSlots && (
                <div className="flex flex-col gap-2">
                  {slotDays.map((d) => (
                    <div key={d.date} className="flex items-center gap-2">
                      <span className="w-24 shrink-0 text-xs font-bold text-white/50">
                        {dayLabel(d.date)}
                      </span>
                      <div className="flex gap-2">
                        {d.slots.map((s) => (
                          <button
                            key={s}
                            onClick={() => pickSlot(d.date, s)}
                            className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-white/80 transition hover:border-brand-green hover:text-brand-green"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {step === "contact" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitContact();
                  }}
                  className="flex flex-col gap-2"
                >
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-brand-green"
                  />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    type="email"
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-brand-green"
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone"
                    type="tel"
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-brand-green"
                  />
                  {error && <div className="text-xs font-semibold text-red-400">{error}</div>}
                  <button
                    type="submit"
                    disabled={sending}
                    className="rounded-xl bg-brand-green px-4 py-3 text-sm font-black text-[#04130a] transition hover:brightness-110 active:scale-95 disabled:opacity-40"
                  >
                    {sending ? "Sending…" : "Send my request"}
                  </button>
                </form>
              )}

              {step === "declined" && (
                <div className="flex gap-2">
                  {textMeHref && (
                    <a
                      href={textMeHref}
                      className="flex-1 rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-bold text-white/80 transition hover:border-brand-green hover:text-brand-green"
                    >
                      Text me this quote
                    </a>
                  )}
                  <button
                    onClick={reset}
                    className="rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white/70 transition hover:border-white/30"
                  >
                    Start over
                  </button>
                </div>
              )}

              {step === "done" && (
                <button
                  onClick={() => setOpen(false)}
                  className="w-full rounded-xl bg-brand-green px-4 py-3 text-sm font-black text-[#04130a] transition hover:brightness-110 active:scale-95"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
