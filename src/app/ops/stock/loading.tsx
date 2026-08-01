/* Instant feedback while the stocktake loads. */
export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 xl:max-w-6xl">
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
        Smiths Detailing · Cairns
      </div>
      <div className="mt-3 h-11 w-52 animate-pulse rounded-lg bg-white/[0.06]" />

      <div className="mt-5 h-24 animate-pulse rounded-2xl bg-white/[0.05]" />
      <div className="mt-6 h-28 animate-pulse rounded-2xl bg-white/[0.05]" />
      <div className="mt-8 h-72 animate-pulse rounded-2xl bg-white/[0.05]" />

      <div className="mt-8 flex items-center gap-2.5 text-sm font-semibold text-white/45">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-brand-green" />
        Loading the stocktake…
      </div>
    </main>
  );
}
