"use client";

import { useState } from "react";

/* Progressive, one-question-at-a-time enquiry form for the Cairns Party Bus
   exclusive-events funnel. Each step is gated: the next question only appears
   once the current one is answered. Choice steps auto-advance, text/contact
   steps use a button. Posts to /api/waitlist tagged "partybus-events" so the
   lead lands in the ops dashboard and emails the shop the moment it comes in. */

type ChoiceStep = { key: string; q: string; sub?: string; type: "choice"; options: string[] };
type TextStep = { key: string; q: string; sub?: string; type: "text"; placeholder: string };
type ContactStep = { key: "contact"; q: string; sub?: string; type: "contact" };
type Step = ChoiceStep | TextStep | ContactStep;

const STEPS: Step[] = [
  {
    key: "people",
    q: "How many people?",
    sub: "A rough headcount is fine.",
    type: "choice",
    options: ["Up to 15", "15 to 30", "30 to 50", "50+"],
  },
  {
    key: "dates",
    q: "Roughly when?",
    sub: "Even a month or a season helps us lock the dates.",
    type: "text",
    placeholder: "e.g. March 2027, or 'spring next year'",
  },
  {
    key: "budget",
    q: "What's your budget?",
    sub: "This helps us build the right experience for you.",
    type: "choice",
    options: ["$10k - $25k", "$25k - $50k", "$50k - $100k", "$100k+"],
  },
  {
    key: "occasion",
    q: "What's the event for?",
    type: "choice",
    options: ["Corporate event", "Wedding", "Milestone"],
  },
  {
    key: "style",
    q: "What style of getaway are you after?",
    type: "choice",
    options: ["Party", "Relaxation"],
  },
  {
    key: "contact",
    q: "Where do we send your custom plan?",
    sub: "We'll call you to plan everything, one on one.",
    type: "contact",
  },
];

const PINK = "#ff2d78";
const CYAN = "#22d3ee";

export default function CairnsEventsForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const current = STEPS[step];
  const total = STEPS.length;
  const pct = state === "done" ? 100 : Math.round((step / total) * 100);

  const answerAndNext = (key: string, value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setError("");
    setStep((s) => Math.min(s + 1, total - 1));
  };

  const next = () => {
    if (current.type === "text") {
      if (!(answers[current.key] || "").trim()) return setError("Give us a rough idea so we can plan around it.");
    }
    setError("");
    setStep((s) => Math.min(s + 1, total - 1));
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Add your name.");
    if (!phone.trim() && !email.trim()) return setError("Add a mobile or email so we can reach you.");
    setState("sending");
    try {
      const message = [
        "CAIRNS PARTY BUS EVENT ENQUIRY",
        `People: ${answers.people || "-"}`,
        `When: ${answers.dates || "-"}`,
        `Budget: ${answers.budget || "-"}`,
        `Occasion: ${answers.occasion || "-"}`,
        `Style: ${answers.style || "-"}`,
      ].join("\n");
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.trim(),
          phone: phone.trim(),
          vehicle: "",
          membership: false,
          source: "partybus-events",
          message,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d?.error || "Something went wrong, try again.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Something went wrong, try again.");
      setState("error");
    }
  };

  const field =
    "w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3.5 text-base text-white outline-none placeholder:text-white/30 transition focus:border-[#22d3ee]";

  if (state === "done") {
    return (
      <div className="rounded-3xl border border-[#22d3ee]/40 bg-[#22d3ee]/[0.06] p-8 text-center sm:p-10">
        <div className="text-4xl">🎉</div>
        <div className="mt-3 font-display text-2xl font-extrabold text-white">You&apos;re in.</div>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/65">
          We&apos;ve got everything we need to start. Keep an eye on your phone, we&apos;ll call you shortly to plan the
          ultimate Cairns getaway.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-6 shadow-[0_20px_80px_-30px_rgba(255,45,120,0.5)] sm:p-8">
      {/* progress */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
          Step {step + 1} of {total}
        </span>
        <span className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: CYAN }}>
          {pct}%
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.max(pct, 6)}%`, background: `linear-gradient(90deg, ${PINK}, ${CYAN})` }}
        />
      </div>

      {/* question */}
      <div className="mt-7">
        <h3 className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">{current.q}</h3>
        {current.sub && <p className="mt-2 text-sm text-white/55">{current.sub}</p>}

        {current.type === "choice" && (
          <div className="mt-6 grid gap-3">
            {current.options.map((o) => {
              const selected = answers[current.key] === o;
              return (
                <button
                  key={o}
                  onClick={() => answerAndNext(current.key, o)}
                  className={`group flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-base font-bold transition active:scale-[0.99] ${
                    selected
                      ? "border-[#ff2d78] bg-[#ff2d78]/15 text-white"
                      : "border-white/15 bg-black/30 text-white/80 hover:border-white/40 hover:bg-white/[0.04]"
                  }`}
                >
                  <span>{o}</span>
                  <span
                    className="text-lg opacity-0 transition group-hover:opacity-100"
                    style={{ color: CYAN }}
                    aria-hidden
                  >
                    →
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {current.type === "text" && (
          <div className="mt-6">
            <input
              autoFocus
              value={answers[current.key] || ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [current.key]: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && next()}
              placeholder={current.placeholder}
              className={field}
            />
            <button
              onClick={next}
              className="mt-4 w-full rounded-full px-6 py-3.5 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95"
              style={{ background: PINK }}
            >
              Continue →
            </button>
          </div>
        )}

        {current.type === "contact" && (
          <div className="mt-6 grid gap-3">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={field}
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Mobile"
              inputMode="tel"
              className={field}
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              inputMode="email"
              className={field}
            />
            <button
              onClick={submit}
              disabled={state === "sending"}
              className="mt-2 w-full rounded-full px-6 py-4 font-display text-base font-black text-white transition hover:brightness-110 active:scale-95 disabled:opacity-50"
              style={{ background: `linear-gradient(90deg, ${PINK}, ${CYAN})` }}
            >
              {state === "sending" ? "Sending…" : "Get my custom plan →"}
            </button>
            <p className="text-center text-[11px] text-white/40">
              No obligation. We&apos;ll call you to plan it, one on one.
            </p>
          </div>
        )}

        {error && <div className="mt-3 text-sm font-semibold text-red-300">{error}</div>}

        {step > 0 && (
          <button onClick={back} className="mt-5 text-xs font-bold text-white/40 transition hover:text-white/70">
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
