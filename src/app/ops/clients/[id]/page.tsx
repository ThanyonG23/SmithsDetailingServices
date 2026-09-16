import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/ops/auth";
import { getSalesClient } from "@/lib/ops/db";
import { CLIENT_SECTIONS, CLIENT_STAGES } from "@/lib/ops/clients-fields";
import { saveClient, removeSalesClient } from "../../actions";

export const metadata: Metadata = {
  title: "Client onboarding | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const field =
  "w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-purple";
const labelCls = "text-[12px] font-bold text-white/70";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  requireAuth();
  const id = Number(params.id);
  const client = id ? await getSalesClient(id) : null;
  if (!client) notFound();
  const d = client.details || {};

  return (
    <main className="mx-auto max-w-3xl px-4 pb-28 pt-8 sm:px-6">
      <Link href="/ops/clients" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/50 transition hover:text-white">
        ← All clients
      </Link>

      <form action={saveClient} className="mt-6">
        <input type="hidden" name="id" value={client.id} />

        {/* header */}
        <div className={EYEBROW}>Client</div>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Business</label>
            <input name="business" defaultValue={client.business} placeholder="Business name" className={`${field} mt-1`} />
          </div>
          <div>
            <label className={labelCls}>Stage</label>
            <select name="stage" defaultValue={client.stage} className={`${field} mt-1`}>
              {CLIENT_STAGES.map((s) => (
                <option key={s} value={s} className="bg-[#0a0a0a]">
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Contact name</label>
            <input name="contact" defaultValue={client.contact} placeholder="Who we deal with" className={`${field} mt-1`} />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input name="phone" defaultValue={client.phone} placeholder="Mobile" className={`${field} mt-1`} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Email</label>
            <input name="email" defaultValue={client.email} placeholder="Email" className={`${field} mt-1`} />
          </div>
        </div>

        {/* discovery sections */}
        {CLIENT_SECTIONS.map((section) => (
          <section key={section.title} className="mt-8">
            <div className={EYEBROW}>{section.title}</div>
            <div className="mt-3 flex flex-col gap-3">
              {section.fields.map((f) => {
                const val = d[f.key] || "";
                return (
                  <div key={f.key}>
                    <label className={labelCls}>
                      {f.label} {f.star && <span className="text-brand-yellow">★</span>}
                    </label>
                    {f.type === "textarea" ? (
                      <textarea name={f.key} defaultValue={val} rows={2} placeholder={f.hint || ""} className={`${field} mt-1 resize-none`} />
                    ) : f.type === "select" ? (
                      <select name={f.key} defaultValue={val} className={`${field} mt-1`}>
                        <option value="" className="bg-[#0a0a0a]">
                          Choose…
                        </option>
                        {(f.options || []).map((o) => (
                          <option key={o} value={o} className="bg-[#0a0a0a]">
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input name={f.key} defaultValue={val} placeholder={f.hint || ""} className={`${field} mt-1`} />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* sticky save bar */}
        <div className="sticky bottom-4 mt-10 rounded-2xl border border-brand-purple/40 bg-[#0a0a0acc] p-3 backdrop-blur">
          <button className="w-full rounded-full bg-brand-purple px-6 py-3.5 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95">
            Save client
          </button>
        </div>
      </form>

      {/* danger zone, two-step delete, no JS needed */}
      <details className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-4">
        <summary className="cursor-pointer list-none text-xs font-bold text-red-300/70">Delete this client</summary>
        <form action={removeSalesClient} className="mt-3">
          <input type="hidden" name="id" value={client.id} />
          <p className="text-xs text-white/45">This permanently removes the client and everything on this page.</p>
          <button className="mt-2 rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs font-black text-red-300 transition hover:bg-red-500/20">
            Yes, delete {client.business || "this client"}
          </button>
        </form>
      </details>
    </main>
  );
}
