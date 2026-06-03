import { REVIEWS, REVIEW_RATING, REVIEW_COUNT } from "@/lib/config";

const AVATAR_COLORS = [
  "#1a73e8",
  "#e8710a",
  "#188038",
  "#a142f4",
  "#d93025",
  "#12a4af",
  "#c5221f",
  "#7b5800",
];

function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.87z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.26a12 12 0 0 0 0 10.76l4.01-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.96 11.96 0 0 0 12 0 12 12 0 0 0 1.26 6.62l4.01 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function Stars({ className = "" }: { className?: string }) {
  return (
    <div className={`flex gap-0.5 ${className}`} aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-4 w-4" style={{ fill: "#FBBC05" }} aria-hidden="true">
          <path d="M12 2l2.95 6.55 7.05.62-5.32 4.66 1.6 6.92L12 17.77 5.72 20.75l1.6-6.92L2 9.17l7.05-.62z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      {/* header */}
      <div className="flex items-center gap-4 rounded-3xl border border-white/12 bg-white/[0.03] p-6">
        <GoogleG className="h-9 w-9" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-white">{REVIEW_RATING.toFixed(1)}</span>
            <Stars />
          </div>
          <div className="mt-1 text-sm text-white/60">Based on {REVIEW_COUNT}+ Google reviews</div>
        </div>
      </div>

      {/* review cards */}
      <div className="-mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-3">
        {REVIEWS.map((r, i) => (
          <div
            key={r.name + i}
            className="flex w-80 flex-none snap-start flex-col rounded-2xl border border-white/12 bg-white/[0.03] p-5"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
              >
                {r.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="truncate font-bold text-white">{r.name}</div>
                <div className="text-xs text-white/50">{r.time}</div>
              </div>
              <GoogleG className="ml-auto h-5 w-5 shrink-0" />
            </div>
            <Stars className="mt-3" />
            <p className="mt-2 text-sm leading-relaxed text-white/80">{r.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
