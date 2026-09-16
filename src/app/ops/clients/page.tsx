import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/ops/auth";
import { getSalesClients, type SalesClient } from "@/lib/ops/db";
import { newSalesClient } from "../actions";

export const metadata: Metadata = {
  title: "Sales clients | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";

const STAGE_CLS: Record<string, string> = {
  onboarding: "bg-brand-yellow/15 text-brand-yellow",
  building: "bg-sky-500/15 text-sky-300",
  live: "bg-brand-green/15 text-brand-green",
  paused: "bg-white/10 text-white/60",
  ended: "bg-red-500/10 text-red-300/80",
};

export default async function ClientsPage() {
  requireAuth();

  let clients: SalesClient[] = [];
  let dbError = false;
  try {
    clients = await getSalesClients();
  } catch {
    dbError = true;
  }

  const field =
    "w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-purple";

  return (
    <main className="mx-auto max-w-none px-4 pb-24 pt-8 sm:px-6 lg:px-8 2xl:max-w-[1760px]">
      <div className={EYEBROW}>Smiths Detailing · Cairns</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Sales <span className="text-brand-purple-soft">clients</span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-white/50">
        Every business you run marketing and sales for. Add a client and fill in their onboarding sheet while you&apos;re
        on the call, everything for that client lives on their page.
      </p>

      {dbError && (
        <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-4 py-3 text-sm text-brand-yellow">
          Database didn&apos;t respond, refresh in a moment.
        </div>
      )}

      {/* add a client */}
      <form action={newSalesClient} className="mt-8 flex flex-col gap-2.5 sm:flex-row">
        <input name="business" placeholder="New client business name" className={`${field} sm:max-w-sm`} />
        <button className="rounded-full bg-brand-purple px-6 py-3 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95">
          + Add client & start onboarding
        </button>
      </form>

      {/* list */}
      <section className="mt-8">
        <div className={EYEBROW}>Your clients ({clients.length})</div>
        {clients.length === 0 ? (
          <p className="mt-3 text-sm text-white/45">No clients yet. Add your first one above.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {clients.map((c) => (
              <Link key={c.id} href={`/ops/clients/${c.id}`} className={`${CARD} p-4 transition hover:border-white/25`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-display text-base font-extrabold tracking-tight text-white">
                      {c.business || "(no name)"}
                    </div>
                    {c.contact && <div className="truncate text-xs text-white/50">{c.contact}</div>}
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${STAGE_CLS[c.stage] || "bg-white/10 text-white/60"}`}>
                    {c.stage}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-white/45">
                  {c.phone && <span>{c.phone}</span>}
                  {c.email && <span className="truncate">{c.email}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
