import type { Metadata } from "next";
import { requireOwner } from "@/lib/ops/auth";
import { getTemplates, type Template } from "@/lib/ops/db";
import { saveTemplate, removeTemplate, seedTemplates } from "../actions";
import CopyButton from "@/components/ops/CopyButton";

export const metadata: Metadata = {
  title: "Templates | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};

const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";
const INPUT =
  "w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-green";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: { tok?: string };
}) {
  requireOwner();

  let templates: Template[] = [];
  let dbError = false;
  try {
    templates = await Promise.race([
      getTemplates(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("db-timeout")), 20000)),
    ]);
  } catch {
    dbError = true;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <div className={EYEBROW}>Smiths Detailing · Cairns</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Temp<span className="text-brand-green">lates</span>
      </h1>
      <p className="mt-3 text-sm text-white/50">
        The packages every GM sends — tap Copy, paste into the chat, done.
      </p>

      {dbError && (
        <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-4 py-3 text-sm text-brand-yellow">
          Database didn&apos;t respond — refresh in a moment.
        </div>
      )}
      {searchParams?.tok && (
        <div className="mt-5 rounded-xl border border-brand-green/40 bg-brand-green/[0.08] px-4 py-2.5 text-sm font-semibold text-brand-green">
          {searchParams.tok === "deleted"
            ? "Template removed ✓"
            : searchParams.tok === "seeded"
            ? "Standard templates loaded ✓"
            : "Template saved ✓"}
        </div>
      )}

      {/* load the standard Cairns set */}
      <form action={seedTemplates} className={`mt-5 ${CARD} flex flex-wrap items-center justify-between gap-3 p-4`}>
        <div>
          <div className="text-sm font-bold text-white">Load Smiths standard templates (20)</div>
          <div className="mt-0.5 text-xs text-white/45">
            Booking flow + Correction · Cut &amp; Polish · Premium Detail · Interior Only (one per size).{" "}
            <b className="text-brand-yellow/80">Replaces all current templates.</b>
          </div>
        </div>
        <button className="shrink-0 rounded-full bg-brand-green px-5 py-2.5 text-xs font-black text-[#04130a] transition hover:brightness-110 active:scale-95">
          Load standard set
        </button>
      </form>

      {templates.length > 0 ? (
        <div className="mt-6 flex flex-col gap-3">
          {templates.map((t) => {
            const body = t.body.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
            return (
              <div key={t.id} className={`${CARD} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="font-display text-base font-extrabold tracking-tight text-white">
                    {t.title || "Untitled"}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <CopyButton text={body} />
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
                <pre className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-white/70">
                  {body}
                </pre>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-6 text-sm text-white/45">
          No templates yet — paste your Google Docs packages in below so every GM sends the same.
        </p>
      )}

      {/* add template */}
      <form action={saveTemplate} className={`mt-4 ${CARD} p-4`}>
        <div className="mb-1 text-sm font-bold text-white">Add a template</div>
        <p className="mb-2 text-xs text-white/45">
          Put the <b className="text-white/60">package name</b> in the title, then paste the whole
          family in the body. Vehicle sizes separated by a blank gap auto-split into one copyable
          template each (e.g. &ldquo;Premium Detail — SUV&rdquo;).
        </p>
        <input name="title" placeholder="Package name (e.g. Premium Detail)" className={INPUT} />
        <textarea
          name="body"
          rows={6}
          placeholder="Paste the full package — all vehicle sizes — here…"
          className={`${INPUT} mt-2 resize-y`}
        />
        <button className="mt-3 rounded-full bg-brand-green px-5 py-2 text-xs font-black text-[#04130a] transition hover:brightness-110 active:scale-95">
          Save template(s)
        </button>
      </form>

      <p className="mt-14 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns · Team only
      </p>
    </main>
  );
}
