import Link from "next/link";
import { BUSINESS, TEXT_TO_BOOK_HREF } from "@/lib/config";

/* Shared shell for the Terms and Privacy pages: simple, readable prose
   on the site's dark theme. */
export default function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#050506]">
      {/* nav */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/50 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center" aria-label="Smiths Detailing home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BUSINESS.logo} alt={BUSINESS.name} className="h-10 w-auto sm:h-11" />
          </Link>
          <a
            href={TEXT_TO_BOOK_HREF}
            className="rounded-full bg-brand-green px-4 py-2 text-xs font-black text-[#04130a] transition hover:brightness-110"
          >
            Free Quote
          </a>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 pb-24 pt-14">
        <Link
          href="/"
          className="text-sm font-semibold text-white/50 transition hover:text-white"
        >
          ← Back to home
        </Link>

        <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-white/40">Last updated: {updated}</p>
        <p className="mt-6 text-base leading-relaxed text-white/70">{intro}</p>

        <div className="mt-12 space-y-10">{children}</div>

        {/* contact block */}
        <div className="mt-14 rounded-2xl border border-white/12 bg-white/[0.03] p-6">
          <h2 className="text-lg font-extrabold text-white">Questions?</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/65">
            Get in touch and we&apos;ll sort it out.
          </p>
          <p className="mt-4 text-sm text-white/70">
            <span className="font-bold text-white">{BUSINESS.name}</span>
            <br />
            {BUSINESS.address}
            <br />
            <a href={`tel:${BUSINESS.phoneE164}`} className="transition hover:text-brand-green">
              {BUSINESS.phone}
            </a>
            <br />
            <a href={`mailto:${BUSINESS.email}`} className="transition hover:text-brand-green">
              {BUSINESS.email}
            </a>
          </p>
        </div>
      </article>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-3xl px-4 py-8 text-xs text-white/35">
          © {new Date().getFullYear()} {BUSINESS.name}.{" "}
          <Link href="/terms" className="transition hover:text-white/70">
            Terms
          </Link>{" "}
          ·{" "}
          <Link href="/privacy" className="transition hover:text-white/70">
            Privacy
          </Link>
        </div>
      </footer>
    </main>
  );
}

/* One numbered section of a legal page. */
export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-xl font-extrabold tracking-tight text-white sm:text-2xl">
        {heading}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-white/65">{children}</div>
    </section>
  );
}

/* Bulleted list with brand ticks. */
export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span className="mt-px shrink-0 font-black text-brand-green">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
