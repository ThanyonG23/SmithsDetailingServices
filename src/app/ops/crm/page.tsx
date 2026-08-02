import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/ops/auth";
import { getCustomers, getTemplates, type Customer, type Template } from "@/lib/ops/db";
import { saveTemplate, removeTemplate } from "../actions";
import CopyButton from "@/components/ops/CopyButton";

export const metadata: Metadata = {
  title: "CRM | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");
const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";
const INPUT =
  "w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-green";

export default async function CrmPage({
  searchParams,
}: {
  searchParams: { q?: string; tok?: string };
}) {
  if (!isAuthed()) redirect("/ops/login");

  const q = (searchParams?.q || "").slice(0, 60);
  let customers: Customer[] = [];
  let templates: Template[] = [];
  let dbError = false;
  try {
    const data = await Promise.race([
      (async () => ({
        templates: await getTemplates(),
        customers: await getCustomers(q),
      }))(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("db-timeout")), 9000)),
    ]);
    ({ templates, customers } = data);
  } catch {
    dbError = true;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <div className={EYEBROW}>Smiths Detailing · Cairns</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        C<span className="text-brand-green">RM</span>
      </h1>
      <p className="mt-3 text-sm text-white/50">
        Your quote templates and every customer — built automatically from the calendar.
      </p>

      {dbError && (
        <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-4 py-3 text-sm text-brand-yellow">
          Database didn&apos;t respond — refresh in a moment.
        </div>
      )}
      {searchParams?.tok && (
        <div className="mt-5 rounded-xl border border-brand-green/40 bg-brand-green/[0.08] px-4 py-2.5 text-sm font-semibold text-brand-green">
          {searchParams.tok === "deleted" ? "Template removed ✓" : "Template saved ✓"}
        </div>
      )}

      {/* ── QUOTE TEMPLATES ────────────────────────────────────────── */}
      <section className="mt-8">
        <div className={EYEBROW}>Quote templates</div>
        <p className="mt-2 text-xs text-white/45">
          The packages every GM sends — tap Copy, paste into the chat, done.
        </p>

        {templates.length > 0 ? (
          <div className="mt-3 flex flex-col gap-3">
            {templates.map((t) => (
              <div key={t.id} className={`${CARD} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="font-display text-base font-extrabold tracking-tight text-white">
                    {t.title || "Untitled"}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <CopyButton text={t.body} />
                    <form action={removeTemplate}>
                      <button
                        name="id"
                        value={t.id}
                        aria-label="Delete template"
                        className="text-sm font-bold text-white/25 transition hover:text-red-400"
                      >
                        ✕
                      </button>
                    </form>
                  </div>
                </div>
                <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-white/70">
                  {t.body}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-white/45">
            No templates yet — paste your Google Docs packages in below so every GM sends the same.
          </p>
        )}

        {/* add template */}
        <form action={saveTemplate} className={`mt-3 ${CARD} p-4`}>
          <div className="mb-2 text-sm font-bold text-white">Add a template</div>
          <input name="title" placeholder="Title (e.g. Exterior Correction Package)" className={INPUT} />
          <textarea
            name="body"
            rows={5}
            placeholder="Paste the full package text here…"
            className={`${INPUT} mt-2 resize-y`}
          />
          <button className="mt-3 rounded-full bg-brand-green px-5 py-2 text-xs font-black text-[#04130a] transition hover:brightness-110 active:scale-95">
            Save template
          </button>
        </form>
      </section>

      {/* ── CUSTOMERS ──────────────────────────────────────────────── */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className={EYEBROW}>Customers</div>
            <p className="mt-2 text-xs text-white/45">
              Auto-built from the calendar — no doubles. Tap a number to call, email to write.
            </p>
          </div>
        </div>

        <form className="mt-3 flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, phone, email, car…"
            className={INPUT}
          />
          <button className="shrink-0 rounded-lg border border-white/15 px-4 text-xs font-bold text-white/70 transition hover:border-white/35 hover:text-white">
            Search
          </button>
        </form>

        {customers.length === 0 ? (
          <p className="mt-4 text-sm text-white/45">
            {q
              ? "No customers match that search."
              : "No customers yet — upload the calendar on the Dashboard to build the list."}
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {customers.map((c) => (
              <div key={c.dedupe_key} className={`${CARD} p-3.5`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-white/90">{c.name || "—"}</div>
                    {c.car && <div className="truncate text-xs text-white/45">{c.car}</div>}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs font-bold tabular-nums text-brand-green">
                      {money(c.total_value)}
                    </div>
                    <div className="text-[11px] text-white/40">
                      {c.bookings} booking{c.bookings === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {c.phone && (
                    <a
                      href={`tel:${c.phone}`}
                      className="rounded-full border border-white/12 bg-black/30 px-3 py-1 text-xs font-semibold text-white/75 transition hover:border-brand-green hover:text-brand-green"
                    >
                      📞 {c.phone}
                    </a>
                  )}
                  {c.email && (
                    <a
                      href={`mailto:${c.email}`}
                      className="max-w-full truncate rounded-full border border-white/12 bg-black/30 px-3 py-1 text-xs font-semibold text-white/75 transition hover:border-brand-green hover:text-brand-green"
                    >
                      ✉️ {c.email}
                    </a>
                  )}
                  {c.last_seen && (
                    <span className="text-[11px] text-white/30">last: {c.last_seen}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-14 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns · Team only
      </p>
    </main>
  );
}
