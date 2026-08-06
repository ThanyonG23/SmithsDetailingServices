import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/ops/auth";
import { getModule, embedUrl, ROLE_LABEL } from "@/lib/ops/training";

export const metadata: Metadata = {
  title: "Training | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";

const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";

export default function ModulePage({ params }: { params: { slug: string } }) {
  requireAuth();
  const m = getModule(params.slug);
  if (!m) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <Link
        href="/ops/training"
        className="text-sm font-bold text-white/50 transition hover:text-brand-green"
      >
        ← All training
      </Link>

      <div className="mt-5 flex items-start gap-4">
        <div className="text-4xl" aria-hidden>
          {m.emoji}
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-green">
            {ROLE_LABEL[m.role]}
          </div>
          <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight tracking-tight text-white">
            {m.title}
          </h1>
          <p className="mt-2 text-sm text-white/55">{m.summary}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {m.lessons.map((lesson, i) => {
          const embed = embedUrl(lesson.video);
          return (
            <div key={i} className={`${CARD} p-5`}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-lg font-extrabold text-white">
                  <span className="text-brand-green">{String(i + 1).padStart(2, "0")}</span>{" "}
                  {lesson.title}
                </h2>
                {lesson.duration && (
                  <span className="shrink-0 text-xs font-bold text-white/40">{lesson.duration}</span>
                )}
              </div>

              {embed && (
                <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
                  <iframe
                    src={embed}
                    title={lesson.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              {!embed && lesson.video && (
                <a
                  href={lesson.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block rounded-full border border-brand-green/40 px-4 py-2 text-sm font-bold text-brand-green transition hover:bg-brand-green/10"
                >
                  Watch video ↗
                </a>
              )}

              {lesson.body && (
                <div className="mt-4 flex flex-col gap-3">
                  {lesson.body.split(/\n\s*\n/).map((para, p) => (
                    <p key={p} className="text-sm leading-relaxed text-white/70">
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {lesson.steps && lesson.steps.length > 0 && (
                <ol className="mt-4 flex flex-col gap-2">
                  {lesson.steps.map((step, s) => (
                    <li key={s} className="flex gap-3 text-sm text-white/80">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-green/15 text-xs font-black text-brand-green">
                        {s + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-12 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns · Team
      </p>
    </main>
  );
}
