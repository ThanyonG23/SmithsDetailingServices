import type { Metadata } from "next";
import { requireOwner } from "@/lib/ops/auth";
import { getTemplates, type Template } from "@/lib/ops/db";
import { saveTemplate, seedTemplates } from "../actions";
import TemplateGroups, { type TemplateGroup } from "@/components/ops/TemplateGroups";
import LeadReplyHelper from "@/components/ops/LeadReplyHelper";

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

  // Group templates into package-type boxes by their title prefix.
  const defs: { key: string; title: string; emoji: string; match: RegExp }[] = [
    { key: "correction", title: "Correction & Coating", emoji: "✨", match: /^correction/i },
    { key: "cutpolish", title: "Premium + Cut & Polish", emoji: "💎", match: /cut\s*&?\s*polish/i },
    { key: "premiumpolish", title: "Premium Detail + Polish", emoji: "🔶", match: /detail \+ polish/i },
    { key: "premium", title: "Premium", emoji: "⭐", match: /^premium/i },
    { key: "interior", title: "Interior", emoji: "🧽", match: /^interior/i },
    { key: "booking", title: "Booking messages", emoji: "💬", match: /^booking/i },
  ];
  // NOTE: only serializable fields go into the group objects — the `match`
  // RegExp must NOT be spread in, or passing groups to the client component
  // throws "server-side exception" (RegExp can't cross the RSC boundary).
  const groups: TemplateGroup[] = defs.map((d) => ({
    key: d.key,
    title: d.title,
    emoji: d.emoji,
    items: [] as Template[],
  }));
  const other: Template[] = [];
  for (const t of templates) {
    const d = defs.find((def) => def.match.test(t.title || ""));
    if (d) groups.find((g) => g.key === d.key)!.items.push(t);
    else other.push(t);
  }
  const shownGroups = groups.filter((g) => g.items.length > 0);
  if (other.length) shownGroups.push({ key: "other", title: "Other", emoji: "📄", items: other });

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
          <div className="text-sm font-bold text-white">Load Smiths standard templates (24)</div>
          <div className="mt-0.5 text-xs text-white/45">
            Booking flow + Correction · Cut &amp; Polish · Premium Detail + Polish · Premium Detail · Interior Only (one per size).{" "}
            <b className="text-brand-yellow/80">Replaces all current templates.</b>
          </div>
        </div>
        <button className="shrink-0 rounded-full bg-brand-green px-5 py-2.5 text-xs font-black text-[#04130a] transition hover:brightness-110 active:scale-95">
          Load standard set
        </button>
      </form>

      {templates.length > 0 ? (
        <TemplateGroups groups={shownGroups} />
      ) : (
        <p className="mt-6 text-sm text-white/45">
          No templates yet — load the standard set above, or paste your packages in below.
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

      <LeadReplyHelper />

      <p className="mt-14 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns · Team only
      </p>
    </main>
  );
}
