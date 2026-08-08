/* Shown instantly while the dashboard loads, so tapping a tab gives
   immediate feedback instead of feeling frozen. */
export default function Loading() {
  return (
    <main className="mx-auto max-w-none px-4 pb-24 pt-8 sm:px-6 lg:px-8 2xl:max-w-[1760px]">
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
        Smiths Detailing · Cairns
      </div>
      <div className="mt-3 h-11 w-52 animate-pulse rounded-lg bg-white/[0.06]" />

      <div className="mt-7 h-44 animate-pulse rounded-3xl bg-white/[0.06]" />

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/[0.05]" />
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="h-32 animate-pulse rounded-2xl bg-white/[0.05]" />
        <div className="h-32 animate-pulse rounded-2xl bg-white/[0.05]" />
      </div>

      <div className="mt-8 flex items-center gap-2.5 text-sm font-semibold text-white/45">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-brand-green" />
        Loading the day…
      </div>
    </main>
  );
}
