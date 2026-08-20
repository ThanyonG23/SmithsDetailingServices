import type { Metadata } from "next";
import { requireOwner } from "@/lib/ops/auth";
import { getStock, type StockItem } from "@/lib/ops/db";
import {
  addStock,
  saveStock,
  deleteStock,
  seedStock,
  reseedStock,
  markOrdered,
  unmarkOrdered,
} from "../actions";

export const metadata: Metadata = {
  title: "Stocktake | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};

const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";
const INPUT =
  "rounded-lg border border-white/12 bg-black/40 px-2.5 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-green";
const CELL =
  "rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white outline-none placeholder:text-white/25 focus:border-brand-green";
const TH =
  "whitespace-nowrap px-2.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-white/40";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export default async function StockPage({
  searchParams,
}: {
  searchParams: { stockok?: string; stockerr?: string };
}) {
  requireOwner();

  let items: StockItem[] = [];
  let dbError = false;
  try {
    // 9s cap so a stuck DB can't hang the render to the function limit.
    items = await Promise.race([
      getStock(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("db-timeout")), 20000)),
    ]);
  } catch {
    dbError = true;
  }

  const byCat = new Map<string, StockItem[]>();
  for (const it of items) {
    const arr = byCat.get(it.category || "Other") || [];
    arr.push(it);
    byCat.set(it.category || "Other", arr);
  }
  const cats = [...byCat.keys()].sort();

  // group the order list by supplier (across categories) so it's one order per place
  const low = items
    .filter((i) => i.current_qty < i.min_qty)
    .sort((a, b) => (a.brand || "").localeCompare(b.brand || "") || a.item.localeCompare(b.item));
  const toOrder = low.filter((i) => !i.ordered);
  const onOrder = low.filter((i) => i.ordered);
  const qty = (n: number, u: string) => `${n}${u}`;

  return (
    <main className="mx-auto max-w-none px-4 pb-24 pt-8 sm:px-6 lg:px-8 2xl:max-w-[1760px]">
      <div className={EYEBROW}>Smiths Detailing · Cairns</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Stock<span className="text-brand-green">take</span>
      </h1>
      <p className="mt-3 text-sm text-white/50">
        Keep the counts current through the week. Anything red needs ordering.
      </p>

      {dbError && (
        <div className="mt-5 rounded-xl border border-brand-yellow/40 bg-brand-yellow/[0.08] px-4 py-3 text-sm text-brand-yellow">
          Database not connected — connect Postgres and reload.
        </div>
      )}
      {searchParams?.stockok && (
        <div className="mt-5 rounded-xl border border-brand-green/40 bg-brand-green/[0.08] px-4 py-2.5 text-sm font-semibold text-brand-green">
          {searchParams.stockok === "added"
            ? "Item added ✓"
            : searchParams.stockok === "deleted"
            ? "Item removed ✓"
            : searchParams.stockok === "seeded"
            ? "Master list loaded ✓"
            : searchParams.stockok === "ordered"
            ? "Ticked as ordered ✓"
            : "Stocktake saved ✓"}
        </div>
      )}

      {/* ── ORDER CHECKLIST ─────────────────────────────────────────── */}
      {low.length > 0 && (
        <section className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/[0.05] p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-300">
            🔴 To order ({toOrder.length})
          </div>

          {toOrder.length === 0 ? (
            <p className="mt-2 text-sm font-semibold text-brand-green">
              Everything low is on order ✓
            </p>
          ) : (
            <div className="mt-3 flex flex-col gap-1.5">
              {toOrder.map((r) => (
                <form
                  key={r.id}
                  action={markOrdered}
                  className="flex items-center gap-3 rounded-xl border border-red-500/25 bg-black/20 px-3 py-2"
                >
                  <input type="hidden" name="id" value={r.id} />
                  <button
                    type="submit"
                    title="Tick when ordered"
                    aria-label={`Mark ${r.item} ordered`}
                    className="group flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-white/25 transition hover:border-brand-green"
                  >
                    <span className="text-sm text-brand-green opacity-0 transition group-hover:opacity-60">
                      ✓
                    </span>
                  </button>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-white/85">{r.item}</span>
                    <span className="ml-2 whitespace-nowrap text-xs text-white/40">
                      have {qty(r.current_qty, r.unit)} · need {qty(r.min_qty, r.unit)}
                    </span>
                  </div>
                  {r.website && (
                    <a
                      href={r.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open supplier to order"
                      className="shrink-0 text-white/40 transition hover:text-brand-green"
                    >
                      ↗
                    </a>
                  )}
                </form>
              ))}
            </div>
          )}

          {onOrder.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                On order ({onOrder.length})
              </div>
              <div className="mt-2 flex flex-col gap-1.5">
                {onOrder.map((r) => (
                  <form
                    key={r.id}
                    action={unmarkOrdered}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 px-3 py-2"
                  >
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      title="Un-tick (not ordered)"
                      aria-label={`Un-mark ${r.item}`}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-brand-green/50 bg-brand-green/15 text-sm text-brand-green"
                    >
                      ✓
                    </button>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold text-white/45 line-through">
                        {r.item}
                      </span>
                      <span className="ml-2 whitespace-nowrap text-xs text-white/30">
                        ordered · have {qty(r.current_qty, r.unit)}/{qty(r.min_qty, r.unit)}
                      </span>
                    </div>
                  </form>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-white/30">
                These clear on their own once you update the count back above the keep level.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ── ADD ITEM ────────────────────────────────────────────────── */}
      <form action={addStock} className={`mt-6 ${CARD} p-4`}>
        <div className="mb-2.5 text-sm font-bold text-white">Add an item</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <input name="item" placeholder="Item *" required className={INPUT} />
          <input name="brand" placeholder="Brand / supplier" className={INPUT} />
          <input name="category" placeholder="Category" list="stockcats" className={INPUT} />
          <input name="website" placeholder="Website / where to buy" className={INPUT} />
          <input name="unit" placeholder="Unit (L, ml, ea)" className={INPUT} />
          <input name="min_qty" type="number" step={0.1} min={0} placeholder="Keep on hand" className={INPUT} />
          <input name="current_qty" type="number" step={0.1} min={0} placeholder="Have now" className={INPUT} />
          <input name="notes" placeholder="Notes" className={`${INPUT} col-span-2`} />
        </div>
        <datalist id="stockcats">
          {cats.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <button className="mt-3 rounded-full bg-brand-green px-5 py-2 text-xs font-black text-[#04130a] transition hover:brightness-110 active:scale-95">
          Add item
        </button>
      </form>

      {/* ── THE TABLE ───────────────────────────────────────────────── */}
      {items.length === 0 ? (
        <div className="mt-8">
          <p className="text-sm text-white/45">No stock items yet.</p>
          <form action={seedStock} className="mt-3">
            <button className="rounded-full bg-brand-green px-5 py-2.5 text-xs font-black text-[#04130a] transition hover:brightness-110 active:scale-95">
              Load Smiths master list (20 items)
            </button>
          </form>
          <p className="mt-2 text-xs text-white/35">…or add items one at a time above.</p>
        </div>
      ) : (
        <form action={saveStock} className="mt-8">
          {/* First submit = Save, so Enter in a cell saves (not a row delete). */}
          <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">
            Save stocktake
          </button>
          {cats.map((cat) => (
            <section key={cat} className="mt-6 first:mt-0">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-green">
                {cat}
              </div>
              <div className={`overflow-x-auto ${CARD}`}>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className={TH}>Item</th>
                      <th className={`${TH} hidden md:table-cell`}>Brand</th>
                      <th className={`${TH} hidden lg:table-cell`}>Website</th>
                      <th className={`${TH} hidden sm:table-cell`}>Keep</th>
                      <th className={TH}>Have</th>
                      <th className={TH}>Status</th>
                      <th className={`${TH} hidden md:table-cell`}>Notes</th>
                      <th className={`${TH} hidden xl:table-cell`}>Date</th>
                      <th className={TH}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(byCat.get(cat) || []).map((it) => {
                      const isLow = it.current_qty < it.min_qty;
                      return (
                        <tr
                          key={it.id}
                          className={`border-b border-white/[0.06] last:border-0 ${
                            isLow && !it.ordered ? "bg-red-500/[0.05]" : ""
                          }`}
                        >
                          {/* Item (+ brand shown here on mobile where the column is hidden) */}
                          <td className="px-2.5 py-2 font-semibold text-white/85">
                            <div className="truncate">{it.item}</div>
                            {it.brand && (
                              <div className="mt-0.5 truncate text-[10px] font-normal text-white/35 md:hidden">
                                {it.brand}
                              </div>
                            )}
                          </td>
                          {/* Brand */}
                          <td className="hidden whitespace-nowrap px-2.5 py-2 text-white/50 md:table-cell">
                            {it.brand}
                          </td>
                          {/* Website (value still saved when hidden) */}
                          <td className="hidden px-2.5 py-2 lg:table-cell">
                            <div className="flex items-center gap-1.5">
                              <input
                                name={`web::${it.id}`}
                                defaultValue={it.website}
                                placeholder="—"
                                className={`${CELL} w-28`}
                              />
                              {it.website && (
                                <a
                                  href={it.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label="Open supplier site"
                                  className="shrink-0 text-white/40 transition hover:text-brand-green"
                                >
                                  ↗
                                </a>
                              )}
                            </div>
                          </td>
                          {/* Keep (min) */}
                          <td className="hidden px-2.5 py-2 sm:table-cell">
                            <span className="inline-flex items-center rounded-lg border border-white/12 bg-black/40 focus-within:border-brand-green">
                              <input
                                type="number"
                                name={`min::${it.id}`}
                                defaultValue={it.min_qty}
                                min={0}
                                step={0.1}
                                className="w-11 bg-transparent px-1.5 py-1 text-right text-white/70 outline-none"
                              />
                              <span className="pr-1.5 text-[11px] text-white/35">{it.unit}</span>
                            </span>
                          </td>
                          {/* Have (current) */}
                          <td className="px-2.5 py-2">
                            <span className="inline-flex items-center rounded-lg border border-white/12 bg-black/40 focus-within:border-brand-green">
                              <input
                                type="number"
                                name={`cur::${it.id}`}
                                defaultValue={it.current_qty}
                                min={0}
                                step={0.1}
                                inputMode="decimal"
                                className="w-11 bg-transparent px-1.5 py-1 text-right text-white outline-none"
                              />
                              <span className="pr-1.5 text-[11px] text-white/40">{it.unit}</span>
                            </span>
                          </td>
                          {/* Status */}
                          <td className="whitespace-nowrap px-2.5 py-2">
                            {!isLow ? (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-green/70">
                                OK
                              </span>
                            ) : it.ordered ? (
                              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/50">
                                Ordered
                              </span>
                            ) : (
                              <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-300">
                                Order
                              </span>
                            )}
                          </td>
                          {/* Notes (value still saved when hidden) */}
                          <td className="hidden px-2.5 py-2 md:table-cell">
                            <input
                              name={`note::${it.id}`}
                              defaultValue={it.notes}
                              placeholder="—"
                              className={`${CELL} w-28`}
                            />
                          </td>
                          {/* Date */}
                          <td className="hidden whitespace-nowrap px-2.5 py-2 text-xs tabular-nums text-white/40 xl:table-cell">
                            {it.updated_at}
                          </td>
                          {/* Delete */}
                          <td className="px-2.5 py-2 text-right">
                            <button
                              formAction={deleteStock}
                              name="id"
                              value={it.id}
                              aria-label="Delete item"
                              className="text-sm font-bold text-white/25 transition hover:text-red-400"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-brand-green px-6 py-3.5 text-sm font-black text-[#04130a] transition hover:brightness-110 active:scale-95 sm:w-auto sm:px-12"
          >
            Save stocktake →
          </button>
        </form>
      )}

      {items.length > 0 && (
        <form action={reseedStock} className="mt-12 border-t border-white/5 pt-6">
          <button className="rounded-full border border-white/12 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white/40 transition hover:border-red-400/40 hover:text-red-300">
            ↻ Reset to master list
          </button>
          <p className="mt-1.5 text-[11px] text-white/30">
            Replaces every row with the Smiths master list — use during setup only, it wipes the
            current counts.
          </p>
        </form>
      )}

      <p className="mt-14 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns · Team only
      </p>
    </main>
  );
}
