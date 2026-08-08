import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/ops/auth";
import { TRAINING, ROLE_LABEL, type TrainingRole } from "@/lib/ops/training";

export const metadata: Metadata = {
  title: "Training | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";

const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";

export default function TrainingIndex() {
  requireAuth();
  const order: TrainingRole[] = ["all", "detailer", "admin"];

  return (
    <main className="mx-auto max-w-none px-4 pb-24 pt-8 sm:px-6 lg:px-8 2xl:max-w-[1760px]">
      <div className={EYEBROW}>Smiths Detailing · Team</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Train<span className="text-brand-green">ing</span>
      </h1>
      <p className="mt-3 text-sm text-white/50">
        Every process at Smiths, in one place — how we do the work, to the standard we do it. Work
        through your modules and check back whenever you need a refresher.
      </p>

      {order.map((role) => {
        const mods = TRAINING.filter((m) => m.role === role);
        if (!mods.length) return null;
        return (
          <section key={role} className="mt-9">
            <div className={EYEBROW}>{ROLE_LABEL[role]}</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {mods.map((m) => (
                <Link
                  key={m.slug}
                  href={`/ops/training/${m.slug}`}
                  className={`${CARD} group flex flex-col p-5 transition hover:border-brand-green/40`}
                >
                  <div className="text-3xl" aria-hidden>
                    {m.emoji}
                  </div>
                  <h2 className="mt-3 font-display text-lg font-extrabold leading-tight text-white">
                    {m.title}
                  </h2>
                  <p className="mt-1 flex-1 text-sm text-white/55">{m.summary}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-white/40">
                      {m.lessons.length} lesson{m.lessons.length === 1 ? "" : "s"}
                    </span>
                    <span className="text-sm font-black text-brand-green transition group-hover:translate-x-0.5">
                      Open →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <p className="mt-12 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns · Team
      </p>
    </main>
  );
}
