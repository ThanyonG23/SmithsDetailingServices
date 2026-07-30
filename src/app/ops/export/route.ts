import { isAuthed } from "@/lib/ops/auth";
import { getAllLogs } from "@/lib/ops/db";

export const dynamic = "force-dynamic";

const COLS = [
  "log_date",
  "jobs_completed",
  "revenue_collected",
  "completed_revenue",
  "ad_spend",
  "quotes",
  "redos",
  "happy_customers",
  "unhappy_customers",
  "notes_today",
  "updated_at",
];

function esc(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export async function GET() {
  if (!isAuthed()) return new Response("Unauthorized", { status: 401 });

  const rows = await getAllLogs();
  const header = COLS.join(",");
  const body = rows.map((r) => COLS.map((c) => esc(r[c])).join(",")).join("\n");
  const csv = header + "\n" + body + "\n";

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="smiths-ops-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
