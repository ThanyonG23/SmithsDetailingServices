"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getOutreach,
  addListings,
  scanLead,
  updateLead,
  deleteLead,
  approveLead,
  approveAllReady,
  stopLead,
  markReplied,
  resetSend,
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
  const [campaign, setCampaign] = useState<"partner" | "affiliate">("partner");
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState<number | null>(null);
  const [scanAll, setScanAll] = useState(false);

  useEffect(() => {
    getOutreach().then(setLeads).catch(() => {});
  }, []);

  const counts = useMemo(() => {
    const c = { total: leads.length, new: 0, written: 0, queued: 0, sent: 0, replied: 0 };
    for (const l of leads) {
      if (l.replied) c.replied++;
      if (l.stage >= 1) c.sent++;
      else if (l.approved && !l.stopped) c.queued++;
      if (l.status === "new") c.new++;
      else if (l.status === "written") c.written++;
    }
    return c;
  }, [leads]);

  async function act(fn: () => Promise<Lead[]>) {
    try {
      setLeads(await fn());
    } catch {
      /* ignore */
    }
  }

  async function onAdd() {
    if (!paste.trim()) return;
    setBusy(true);
    try {
      setLeads(await addListings(paste, campaign));
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
        Paste website links (best, it scrapes their email) or a Google Maps dump. Claude writes a personalised giveaway
        email for each. Approve the ones you want, and the sender trickles them out from your Gmail, about one an hour,
        7am to 9pm, with a day-2 and day-7 follow-up that stops the moment they reply. No email found? Call them instead.
      </p>

      {/* paste box */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Campaign</span>
          <div className="inline-flex rounded-full border border-white/15 bg-black/30 p-1 text-[11px] font-black uppercase tracking-[0.08em]">
            <button
              type="button"
              onClick={() => setCampaign("partner")}
              className={`rounded-full px-4 py-1.5 transition ${campaign === "partner" ? "bg-brand-purple text-white" : "text-white/50 hover:text-white"}`}
            >
              Giveaway partners
            </button>
            <button
              type="button"
              onClick={() => setCampaign("affiliate")}
              className={`rounded-full px-4 py-1.5 transition ${campaign === "affiliate" ? "bg-brand-green text-[#04130a]" : "text-white/50 hover:text-white"}`}
            >
              Affiliates
            </button>
          </div>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">
          {campaign === "affiliate" ? "Paste links/handles of people with an audience" : "Paste a Google Maps list, or website links"}
        </div>
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
          {counts.written > 0 && (
            <button
              onClick={() => act(approveAllReady)}
              className="rounded-xl bg-brand-green/20 px-5 py-2.5 text-sm font-black text-brand-green transition hover:bg-brand-green/30"
            >
              Approve all ready
            </button>
          )}
          <span className="ml-auto text-xs text-white/40">
            {counts.total} total · {counts.queued} queued · {counts.sent} sent · {counts.replied} replied
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
            onApprove={(a) => act(() => approveLead(l.id, a))}
            onStop={() => act(() => stopLead(l.id))}
            onReplied={() => act(() => markReplied(l.id))}
            onReset={() => act(() => resetSend(l.id))}
          />
        ))}
      </div>
    </div>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function LeadCard({
  lead,
  scanning,
  onScan,
  onPatch,
  onDelete,
  onApprove,
  onStop,
  onReplied,
  onReset,
}: {
  lead: Lead;
  scanning: boolean;
  onScan: () => void;
  onPatch: (p: { subject?: string; body?: string; email?: string; status?: string }) => void;
  onDelete: () => void;
  onApprove: (approved: boolean) => void;
  onStop: () => void;
  onReplied: () => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(lead.subject);
  const [body, setBody] = useState(lead.body);
  const [email, setEmail] = useState(lead.email);
  const [dmCopied, setDmCopied] = useState(false);

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
            {lead.campaign === "affiliate" && <span className="font-bold text-brand-green">affiliate recruit</span>}
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
          {/* auto-send pipeline status + controls */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-bold ${
                lead.replied
                  ? "text-brand-green"
                  : lead.bounced
                    ? "text-red-300"
                    : lead.stopped
                      ? "text-white/50"
                      : lead.stage >= 1
                        ? "text-brand-purple-soft"
                        : lead.approved
                          ? "text-brand-green"
                          : "text-white/40"
              }`}
            >
              {lead.replied
                ? "Replied, sequence stopped ✓"
                : lead.bounced
                  ? `Bounced${lead.send_error ? ": " + lead.send_error : ""}`
                  : lead.stopped
                    ? "Paused"
                    : lead.stage === 3
                      ? "Done, 3 emails sent"
                      : lead.stage === 2
                        ? `Followed up, final due ${fmtDate(lead.next_action_at)}`
                        : lead.stage === 1
                          ? `Sent, follow-up due ${fmtDate(lead.next_action_at)}`
                          : lead.approved
                            ? "Queued for auto-send"
                            : "Not queued"}
            </span>
            <div className="ml-auto flex flex-wrap gap-1.5">
              {!lead.approved && lead.stage === 0 && !lead.stopped && (
                <button
                  onClick={() => onApprove(true)}
                  disabled={!email.trim()}
                  className="rounded-lg bg-brand-green px-3 py-1.5 text-xs font-black text-[#04130a] transition hover:brightness-110 disabled:opacity-40"
                  title={email.trim() ? "" : "Needs an email address first"}
                >
                  Approve for auto-send
                </button>
              )}
              {lead.approved && lead.stage < 3 && !lead.replied && !lead.stopped && (
                <button onClick={onStop} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-white/70 transition hover:border-white/35 hover:text-white">
                  Pause
                </button>
              )}
              {lead.stage >= 1 && !lead.replied && (
                <button onClick={onReplied} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-white/70 transition hover:border-white/35 hover:text-white">
                  Mark replied
                </button>
              )}
              {(lead.stopped || lead.bounced) && (
                <button onClick={onReset} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-white/70 transition hover:border-white/35 hover:text-white">
                  Requeue
                </button>
              )}
            </div>
          </div>
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
            {lead.campaign === "affiliate" && lead.sms && (
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(lead.sms).then(() => {
                    setDmCopied(true);
                    setTimeout(() => setDmCopied(false), 1600);
                  }).catch(() => {});
                }}
                className="rounded-xl border border-brand-green/40 bg-brand-green/[0.08] px-4 py-2.5 text-sm font-bold text-brand-green transition hover:brightness-110"
              >
                {dmCopied ? "Copied ✓" : "Copy DM"}
              </button>
            )}
            {lead.phone && (
              <a
                href={`tel:${lead.phone.replace(/\s+/g, "")}`}
                className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white/70 transition hover:border-white/35 hover:text-white"
              >
                Call {lead.phone}
              </a>
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
              <span className="text-[11px] text-white/40">No email found, add one above, or call them (cold calling is legal in AU).</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
