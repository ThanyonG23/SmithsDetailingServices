"use client";

import Link from "next/link";
import { useState } from "react";
import { BUSINESS } from "@/lib/config";

/* Shared site navigation. Desktop shows the section links + phone + a CTA;
   mobile collapses to a hamburger menu. `cta` sets the right-side button
   (defaults to a call button). */
const LINKS = [
  { href: "/detailing", label: "Detailing" },
  { href: "/membership", label: "Membership" },
];

export default function SiteNav({
  cta,
  accent = "green",
}: {
  cta?: { label: string; href: string };
  accent?: "green" | "purple";
}) {
  const [open, setOpen] = useState(false);
  const button = cta ?? { label: "Call us", href: `tel:${BUSINESS.phoneE164}` };
  const btnColor = accent === "purple" ? "bg-brand-purple text-white" : "bg-brand-green text-brand-ink";

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" aria-label="Smiths home" className="flex shrink-0 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BUSINESS.logo} alt={BUSINESS.name} className="h-10 w-auto sm:h-11" />
        </Link>

        {/* desktop links, absolutely centred on the bar */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-semibold text-white/70 transition hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href={`tel:${BUSINESS.phoneE164}`} className="hidden text-sm font-bold text-white/70 transition hover:text-white lg:block">
            {BUSINESS.phone}
          </a>
          <a
            href={button.href}
            className={`hidden rounded-full ${btnColor} px-4 py-2 text-xs font-black transition hover:brightness-110 sm:inline-flex`}
          >
            {button.label}
          </a>
          {/* hamburger (mobile) */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white transition hover:border-white/35 md:hidden"
          >
            {open ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {open && (
        <nav className="flex flex-col gap-1 border-t border-white/10 bg-black/85 px-4 py-3 backdrop-blur md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={button.href}
            onClick={() => setOpen(false)}
            className={`mt-1 rounded-full ${btnColor} px-4 py-2.5 text-center text-sm font-black`}
          >
            {button.label}
          </a>
          <a
            href={`tel:${BUSINESS.phoneE164}`}
            onClick={() => setOpen(false)}
            className="px-3 py-2 text-center text-sm font-bold text-white/60"
          >
            {BUSINESS.phone}
          </a>
        </nav>
      )}
    </header>
  );
}
