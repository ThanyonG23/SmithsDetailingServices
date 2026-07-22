import Link from "next/link";
import type { Metadata } from "next";
import { BUSINESS } from "@/lib/config";
import { ACTIVE_TEAM } from "@/lib/referrals";

/* ---------------------------------------------------------------------
   INTERNAL STAFF PAGE — unlisted.
   Nothing on the site links here, and it's set to noindex, so the only
   way in is the direct link. Deliberately not added to robots.txt: that
   file is public and would advertise the path.
   --------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: "Set up your accounts | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};

/** TikTok rejects usernames longer than this. */
const TIKTOK_MAX = 24;

function Station({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-x-5 gap-y-4 border-b border-white/10 py-10 sm:grid-cols-[3rem_1fr]">
      <div className="flex h-9 w-12 items-center justify-center rounded-lg border border-brand-green/35 bg-brand-green/10 font-mono text-sm font-bold text-brand-green">
        {n}
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="max-w-xl text-[15px] leading-relaxed text-white/65">{children}</p>;
}

/** Checkbox list — plain inputs, so they tick on any phone without JS. */
function Ticks({ id, items }: { id: string; items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, i) => (
        <li key={`${id}-${i}`} className="flex gap-3">
          <input
            type="checkbox"
            id={`${id}-${i}`}
            className="mt-1 h-4 w-4 shrink-0 accent-brand-green"
          />
          <label
            htmlFor={`${id}-${i}`}
            className="cursor-pointer text-[15px] leading-relaxed text-white/70"
          >
            {item}
          </label>
        </li>
      ))}
    </ul>
  );
}

function Callout({
  tone,
  heading,
  children,
}: {
  tone: "warn" | "good";
  heading: string;
  children: React.ReactNode;
}) {
  const warn = tone === "warn";
  return (
    <div
      className={`rounded-2xl border p-5 ${
        warn
          ? "border-brand-yellow/25 bg-brand-yellow/[0.06]"
          : "border-brand-green/25 bg-brand-green/[0.06]"
      }`}
    >
      <h3
        className={`text-[11px] font-bold uppercase tracking-[0.14em] ${
          warn ? "text-brand-yellow" : "text-brand-green"
        }`}
      >
        {heading}
      </h3>
      <div className="mt-2 flex flex-col gap-2 text-[15px] leading-relaxed text-white/70">
        {children}
      </div>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-brand-green/10 px-1.5 py-0.5 font-mono text-[0.85em] text-brand-green">
      {children}
    </span>
  );
}

export default function SocialSetupPage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" aria-label="Smiths Detailing home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BUSINESS.logo} alt={BUSINESS.name} className="h-10 w-auto" />
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/30">
            Team only
          </span>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 pb-24 pt-12">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-green">
          Smiths Detailing · Cairns
        </div>
        <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
          Set up your accounts
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65">
          Three accounts, one handle, about twenty minutes. Once they&apos;re live you post
          your own before-and-afters, and you get paid on every job that comes through your
          link.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-white/40">
          <span>
            Use <b className="font-semibold text-white/70">your own email</b>
          </span>
          <span>
            Use <b className="font-semibold text-white/70">your own mobile</b>
          </span>
          <span>
            Time: <b className="font-semibold text-white/70">~20 min</b>
          </span>
        </div>

        <div className="mt-10 border-t border-white/10">
          {/* ── 01 ── */}
          <Station n="01" title="Your handle is already picked">
            <P>
              Use the exact one below on <b className="text-white">all three</b> platforms,
              so anyone who finds you on one can find you on the others.
            </P>

            <div className="overflow-x-auto rounded-2xl border border-white/12 bg-white/[0.03]">
              <table className="w-full border-collapse font-mono text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Name", "Handle", "Length"].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-white/40"
                      >
                        {h}
                      </th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {ACTIVE_TEAM.map((m) => {
                    const handle = m.handle ?? `${m.code}.smithsdetailing`;
                    const atLimit = handle.length >= TIKTOK_MAX;
                    return (
                      <tr key={m.code} className="border-b border-white/[0.07] last:border-0">
                        <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-brand-green">
                          {m.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-white/85">
                          {handle}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-white/40">
                          {handle.length}/{TIKTOK_MAX}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="block h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                            <span
                              className={`block h-full rounded-full ${
                                atLimit ? "bg-brand-yellow" : "bg-brand-green"
                              }`}
                              style={{
                                width: `${Math.min(100, (handle.length / TIKTOK_MAX) * 100)}%`,
                              }}
                            />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Callout tone="warn" heading="Don't shorten it or add anything">
              <p>
                TikTok won&apos;t accept a username over{" "}
                <b className="text-white">{TIKTOK_MAX} characters</b>, and Federica&apos;s is
                exactly {TIKTOK_MAX} &mdash; so there&apos;s no room for an extra letter,
                number or underscore.
              </p>
              <p>
                If a handle comes back as already taken, message the group chat instead of
                inventing a variation.
              </p>
            </Callout>
          </Station>

          {/* ── 02 ── */}
          <Station n="02" title="Facebook — make a Page, not a new profile">
            <P>
              Log in with the personal Facebook you already have, and create a Page from it.
              Do <b className="text-white">not</b> create a second personal profile &mdash;
              Facebook bans duplicates and will lock you out of both.
            </P>
            <Ticks
              id="fb"
              items={[
                <>
                  Facebook → menu → <b className="text-white">Pages</b> → Create new Page
                </>,
                <>
                  Page name: <Mono>Federica | Smiths Detailing</Mono>
                </>,
                <>
                  Category: <b className="text-white">Car Detailing Service</b>
                </>,
                <>Username: your handle from step 01</>,
                <>
                  Profile photo: a clear shot of <b className="text-white">your face</b>.
                  Cover photo: the best car you&apos;ve finished.
                </>,
              ]}
            />
          </Station>

          {/* ── 03 ── */}
          <Station n="03" title="Instagram — switch it to Professional">
            <P>
              A personal account can&apos;t show you your numbers and can&apos;t be linked to
              the shop, so switch it over as soon as you&apos;ve made it.
            </P>
            <Ticks
              id="ig"
              items={[
                <>
                  Sign up with <b className="text-white">your own email</b>, using your handle
                </>,
                <>
                  Settings → Account type →{" "}
                  <b className="text-white">Switch to professional</b> → Business
                </>,
                <>
                  Category: <b className="text-white">Car Detailing Service</b>
                </>,
                <>Link it to the Facebook Page you just made</>,
              ]}
            />
          </Station>

          {/* ── 04 ── */}
          <Station n="04" title="TikTok — Business account, same handle">
            <Ticks
              id="tt"
              items={[
                <>Sign up, then set your username to the same handle</>,
                <>
                  Profile → Settings → Account →{" "}
                  <b className="text-white">Switch to Business Account</b>
                </>,
                <>
                  Category: <b className="text-white">Automotive</b>
                </>,
              ]}
            />
          </Station>

          {/* ── 05 ── */}
          <Station n="05" title="Use the same bio on all three">
            <P>Swap in your own name on the last line. Nothing else changes.</P>
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-white/12 border-l-[3px] border-l-brand-green bg-white/[0.03] p-5 font-mono text-[13px] leading-relaxed text-white/80">
{`Detailer at Smiths Detailing, Cairns
Paint correction / ceramic coating / interior resets
Free quote, straight to my phone:
smithsdetailingservices.com.au/r/federica`}
            </pre>
          </Station>

          {/* ── 06 ── */}
          <Station n="06" title="Your link, and how you get paid">
            <P>
              Your link goes in the bio on all three accounts:{" "}
              <Mono>smithsdetailingservices.com.au/r/yourname</Mono>
            </P>
            <P>
              Anyone who taps it gets the normal website, but the quote text they send us
              comes through tagged with your name. When that job is finished and paid, you
              get <b className="text-white">10% of the invoice</b>, on top of your normal
              pay.
            </P>
            <Callout tone="good" heading="What that's worth">
              <p>
                An average job is around $1,000, so that&apos;s{" "}
                <b className="text-white">$100</b>. A full paint correction and ceramic
                package is $2,200 &mdash; <b className="text-white">$220</b> from one video.
              </p>
            </Callout>
            <P>
              It&apos;s tracked off the customer&apos;s own text message, so it still counts
              if they save the link and book a month later.
            </P>
          </Station>

          {/* ── 07 ── */}
          <Station n="07" title="What to post">
            <P>
              Keep it boring and repeatable. One clip a day beats a perfect clip a fortnight.
            </P>
            <Ticks
              id="post"
              items={[
                <>
                  <b className="text-white">Same shot, every car.</b> Film the dirty one
                  before you start, from the same angle and distance. Film it again when
                  it&apos;s done.
                </>,
                <>
                  <b className="text-white">Fifteen seconds.</b> Before, then after. No
                  talking needed.
                </>,
                <>
                  <b className="text-white">The worst cars do best.</b> The filthier it
                  started, the more it gets watched.
                </>,
                <>
                  <b className="text-white">Ask the customer first</b>, and keep number
                  plates and anything left inside the car out of shot.
                </>,
              ]}
            />
          </Station>
        </div>

        <div className="mt-10 flex flex-col gap-2 text-sm text-white/45">
          <p>
            <b className="font-semibold text-white/75">Stuck on any of it?</b> Message the
            group chat rather than guessing &mdash; especially if a handle comes back as
            taken.
          </p>
          <p>
            A shared Drive folder for raw clips is coming shortly. Hang on to your footage
            until then.
          </p>
        </div>
      </article>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-3xl px-4 py-8 text-xs text-white/30">
          {BUSINESS.name} · {BUSINESS.address}
        </div>
      </footer>
    </main>
  );
}
