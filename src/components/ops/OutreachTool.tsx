"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getOutreach,
  addListings,
  scanLead,
  updateLead,
  deleteLead,
  type Lead,
} from "@/app/ops/outreach/actions";

/* Outreach tool: paste listings, Claude scans + writes each email, you send from
   your own Gmail via a compose link. No auto-blasting (protects the account and
   stays Spam-Act compliant). */

function gmailComposeUrl(to: string, subject: string, body: string): string {
  const p = new URLSearchParams({ view: "cm", fs: "1", to, su: subject, body });
  return `https://mail.google.com/mail/?${p.toString()}`;
}

const STATUS_STYLE: Record<string, string> = {
  new: "bg-white/10 text-white/60",
  written: "bg-brand-purple/20 text-brand-purple-soft",
  sent: "bg-brand-green/15 text-brand-green",
  skipped: "bg-white/5 text-white/35",
};

export default function OutreachTool() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [paste, setPaste] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState<number | null>(null);
  const [scanAll, setScanAll] = useState(false);

  useEffect(() => {
    getOutreach().then(setLeads).catch(() => {});
  }, []);

  const counts = useMemo(() => {
    const c = { total: leads.length, new: 0, written: 0, sent: 0 };
    for (const l of leads) {
      if (l.status === "new") c.new++;
      else if (l.status === "written") c.written++;
      else if (l.status === "sent") c.sent++;
    }
    return c;
  }, [leads]);

  async function onAdd() {
    if (!paste.trim()) return;
    setBusy(true);
    try {
      setLeads(await addListings(paste));
      setPaste("");
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  async function onScan(id: number) {
    setScanning(id);
    try {
      setLeads(await scanLead(id));
    } catch {
      /* ignore */
    } finally {
      setScanning(null);
    }
  }

  // Scan every 'new' lead one at a time (sequential avoids serverless timeouts
  // and the DB pooler choking on parallel work).
  async function onScanAll() {
    setScanAll(true);
    try {
      const ids = leads.filter((l) => l.status === "new").map((l) => l.id);
      for (const id of ids) {
        setScanning(id);
        try {
          setLeads(await scanLead(id));
        } catch {
          /* keep going */
        }
      }
    } finally {
      setScanning(null);
      setScanAll(false);
    }
  }

  async function patch(id: number, p: { subject?: string; body?: string; email?: string; status?: string }) {
    try {
      setLeads(await updateLead(id, p));
    } catch {
      /* ignore */
    }
  }

  async function onDelete(id: number) {
    try {
      setLeads(await deleteLead(id));
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        Outreach <span className="text-brand-purple-soft">machine</span>
      </h1>
      <p className="mt-1 text-sm text-white/45">
        Paste a Google Maps results dump (names, ratings, phones) or website links. Claude writes a personalised giveaway
        email and a text for each. You review and send from your own Gmail, or text the phone we parsed.
      </p>

      {/* paste box */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Paste a Google Maps list, or website links</div>
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={4}
          placeholder={"Paste the whole Google Maps results list here, or website links one per line."}
          className="mt-2 w-full resize-y rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-brand-purple-soft"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            onClick={onAdd}
            disabled={busy || !paste.trim()}
            className="rounded-xl bg-brand-purple px-5 py-2.5 text-sm font-black text-white transition hover:brightness-110 disabled:opacity-40"
          >
            Add to list
          </button>
          {counts.new > 0 && (
            <button
              onClick={onScanAll}
              disabled={scanAll || busy}
              className="rounded-xl bg-brand-purple-soft/20 px-5 py-2.5 text-sm font-black text-brand-purple-soft transition hover:bg-brand-purple-soft/30 disabled:opacity-40"
            >
              {scanAll ? "Scanning…" : `Scan & write all new (${counts.new})`}
            </button>
          )}
          <span className="ml-auto text-xs text-white/40">
            {counts.total} total · {counts.written} written · {counts.sent} sent
          </span>
        </div>
      </div>

      {/* list */}
      <div className="mt-6 flex flex-col gap-3">
        {leads.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/12 p-8 text-center text-sm text-white/40">
            Nothing yet. Paste some business links above to get started.
          </div>
        )}
        {leads.map((l) => (
          <LeadCard
            key={l.id}
            lead={l}
            scanning={scanning === l.id}
            onScan={() => onScan(l.id)}
            onPatch={(p) => patch(l.id, p)}
            onDelete={() => onDelete(l.id)}
          />
        ))}
      </div>
    </div>
  );
}

function LeadCard({
  lead,
  scanning,
  onScan,
  onPatch,
  onDelete,
}: {
  lead: Lead;
  scanning: boolean;
  onScan: () => void;
  onPatch: (p: { subject?: string; body?: string; email?: string; status?: string }) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(lead.subject);
  const [body, setBody] = useState(lead.body);
  const [email, setEmail] = useState(lead.email);

  useEffect(() => {
    setSubject(lead.subject);
    setBody(lead.body);
    setEmail(lead.email);
  }, [lead.subject, lead.body, lead.email]);

  const host = (() => {
    try {
      return new URL(lead.url).hostname.replace(/^www\./, "");
    } catch {
      return lead.url;
    }
  })();

  const written = lead.status === "written" || lead.status === "sent";
  const canGmail = written && !!email.trim();

  function openGmail() {
    window.open(gmailComposeUrl(email.trim(), subject, body), "_blank", "noopener");
    if (lead.status !== "sent") onPatch({ status: "sent" });
  }

  function copySms() {
    navigator.clipboard?.writeText(lead.sms || body).catch(() => {});
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-extrabold text-white">{lead.business || host}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${STATUS_STYLE[lead.status] || STATUS_STYLE.new}`}>
              {lead.status}
            </span>
          </div>
          {lead.url && (
            <a href={lead.url} target="_blank" rel="noreferrer" className="mt-0.5 block truncate text-xs text-brand-purple-soft underline underline-offset-2 hover:text-white">
              {host}
            </a>
          )}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-white/45">
            {lead.category && <span>{lead.category}</span>}
            {lead.rating && <span>★ {lead.rating}</span>}
            {lead.phone && <span>{lead.phone}</span>}
            {lead.channel && <span>via {lead.channel}</span>}
            {lead.prize && <span>prize: {lead.prize}</span>}
          </div>
          {lead.error && <div className="mt-1 text-[11px] font-semibold text-red-300">{lead.error}</div>}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={onScan}
            disabled={scanning}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-white/70 transition hover:border-white/35 hover:text-white disabled:opacity-40"
          >
            {scanning ? "Scanning…" : written ? "Rescan" : "Scan & write"}
          </button>
          <button onClick={onDelete} className="text-[11px] text-white/30 underline underline-offset-2 hover:text-white/70">
            delete
          </button>
        </div>
      </div>

      {written && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <button onClick={() => setOpen((o) => !o)} className="text-xs font-bold text-brand-purple-soft hover:text-white">
            {open ? "Hide email ▲" : "Show / edit email ▼"}
          </button>

          {open && (
            <div className="mt-3 flex flex-col gap-2.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">To</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => email !== lead.email && onPatch({ email })}
                placeholder="no email found, add one or use the SMS text"
                className="w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25 focus:border-brand-purple-soft"
              />
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onBlur={() => subject !== lead.subject && onPatch({ subject })}
                className="w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-brand-purple-soft"
              />
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onBlur={() => body !== lead.body && onPatch({ body })}
                rows={14}
                className="w-full resize-y rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-sm leading-relaxed text-white outline-none focus:border-brand-purple-soft"
              />
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={openGmail}
              disabled={!canGmail}
              className="rounded-xl bg-brand-green px-5 py-2.5 text-sm font-black text-[#04130a] transition hover:brightness-110 disabled:opacity-40"
              title={canGmail ? "" : "No email address for this lead"}
            >
              Open in Gmail →
            </button>
            {lead.phone && (
              <a
                href={`sms:${lead.phone.replace(/\s+/g, "")}?&body=${encodeURIComponent(lead.sms || body)}`}
                className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white/70 transition hover:border-white/35 hover:text-white"
              >
                Text →
              </a>
            )}
            {lead.sms && (
              <button
                onClick={copySms}
                className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white/70 transition hover:border-white/35 hover:text-white"
              >
                Copy SMS text
              </button>
            )}
            {lead.status === "sent" ? (
              <button onClick={() => onPatch({ status: "written" })} className="text-xs text-white/40 underline underline-offset-2 hover:text-white/70">
                mark unsent
              </button>
            ) : (
              <button onClick={() => onPatch({ status: "sent" })} className="text-xs text-white/40 underline underline-offset-2 hover:text-white/70">
                mark sent
              </button>
            )}
            {!canGmail && written && (
              <span className="text-[11px] text-white/40">No email, add one above or use the SMS text.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
