import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/ops/auth";
import { getStock, type StockItem } from "@/lib/ops/db";
import { addStock, saveStock, deleteStock, seedStock } from "../actions";

export const metadata: Metadata = {
  title: "Stocktake | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};

const EYEBROW = "text-[11px] font-bold uppercase tracking-[0.22em] text-white/40";
const CARD = "rounded-2xl border border-white/10 bg-white/[0.02]";
const INPUT =
  "rounded-lg border border-white/12 bg-black/40 px-2.5 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-green";

export default async function StockPage({
  searchParams,
}: {
  searchParams: { stockok?: string; stockerr?: string };
}) {
  if (!isAuthed()) redirect("/ops/login");

  let items: StockItem[] = [];
  let dbError = false;
  try {
    items = await getStock();
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
  const reorder = items.filter((i) => i.current_qty < i.min_qty);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <div className={EYEBROW}>Smiths Detailing · Cairns</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Stock<span className="text-brand-green">take</span>
      </h1>
      <p className="mt-3 text-sm text-white/50">
        Ashlee keeps the counts current through the week. Anything red needs ordering.
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
            ? "Starting list loaded ✓"
            : "Stocktake saved ✓"}
        </div>
      )}

      {/* reorder summary — the order list */}
      {reorder.length > 0 && (
        <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">
          <b className="font-bold">
            🔴 To order ({reorder.length}):
          </b>{" "}
          {reorder
            .map((r) => `${r.item} (have ${r.current_qty}${r.unit}, need ${r.min_qty}${r.unit})`)
            .join("  ·  ")}
        </div>
      )}

      {/* add item */}
      <form action={addStock} className={`mt-6 ${CARD} p-4`}>
        <div className="mb-2.5 text-sm font-bold text-white">Add an item</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <input name="item" placeholder="Item *" required className={INPUT} />
          <input name="brand" placeholder="Brand" className={INPUT} />
          <input name="category" placeholder="Category" list="stockcats" className={INPUT} />
          <input name="unit" placeholder="Unit (L, ml)" className={INPUT} />
          <input name="min_qty" type="number" step={0.1} min={0} placeholder="Need (min)" className={INPUT} />
          <input name="current_qty" type="number" step={0.1} min={0} placeholder="Have (current)" className={INPUT} />
          <input name="website" placeholder="Website (optional)" className={`${INPUT} col-span-2 sm:col-span-3`} />
          <input name="notes" placeholder="Notes (optional)" className={`${INPUT} col-span-2 sm:col-span-3`} />
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

      {/* the stock table */}
      {items.length === 0 ? (
        <div className="mt-8">
          <p className="text-sm text-white/45">No stock items yet.</p>
          <form action={seedStock} className="mt-3">
            <button className="rounded-full bg-brand-green px-5 py-2.5 text-xs font-black text-[#04130a] transition hover:brightness-110 active:scale-95">
              Load Smiths starting list (10 chemicals)
            </button>
          </form>
          <p className="mt-2 text-xs text-white/35">…or add items one at a time above.</p>
        </div>
      ) : (
        <form action={saveStock} className="mt-8">
          {cats.map((cat) => (
            <section key={cat} className="mt-6 first:mt-0">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-green">
                {cat}
              </div>
              <div className={`overflow-x-auto ${CARD}`}>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Item", "Brand", "Need", "Have", "Status", "Notes", ""].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-white/40"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(byCat.get(cat) || []).map((it) => {
                      const low = it.current_qty < it.min_qty;
                      return (
                        <tr
                          key={it.id}
                          className={`border-b border-white/[0.06] last:border-0 ${
                            low ? "bg-red-500/[0.05]" : ""
                          }`}
                        >
                          <td className="whitespace-nowrap px-3 py-2 font-semibold text-white/85">
                            {it.item}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-white/50">{it.brand}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-white/60 tabular-nums">
                            {it.min_qty}
                            {it.unit}
                          </td>
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center rounded-lg border border-white/12 bg-black/40 focus-within:border-brand-green">
                              <input
                                type="number"
                                name={`cur::${it.id}`}
                                defaultValue={it.current_qty}
                                min={0}
                                step={0.1}
                                inputMode="decimal"
                                className="w-14 bg-transparent px-2 py-1 text-right text-white outline-none"
                              />
                              <span className="pr-1.5 text-xs text-white/40">{it.unit}</span>
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2">
                            {low ? (
                              <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-300">
                                Order
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-green/70">
                                OK
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              name={`note::${it.id}`}
                              defaultValue={it.notes}
                              placeholder="—"
                              className="w-full min-w-[7rem] rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white outline-none placeholder:text-white/25 focus:border-brand-green"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
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

      <p className="mt-14 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/20">
        Smiths Detailing · Cairns · Team only
      </p>
    </main>
  );
}
