import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import SiteNav from "@/components/SiteNav";
import FreeEntryForm from "@/components/FreeEntryForm";

export const metadata: Metadata = {
  title: "Free entry · Smiths members' draw",
  description: "Enter the Smiths members' draw for free. No purchase necessary.",
  alternates: { canonical: "/free-entry" },
};

export default function FreeEntryPage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <SiteNav cta={{ label: "Join now", href: "/membership" }} accent="purple" />

      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-[6%] h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-[0.16] blur-[120px]"
          style={{ background: "radial-gradient(closest-side, #7c2ff5, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-lg px-5 pb-16 pt-14 sm:pt-20">
          <Reveal>
            <div className="text-center">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-purple-soft">No purchase necessary</div>
              <h1 className="mt-2 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
                Enter the draw <span className="text-brand-purple-soft">for free</span>
              </h1>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/65">
                You don&apos;t have to be a paying member to go in our draws. Pop your details in below for one free entry
                into the current members&apos; draw. No payment, no catch.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-8">
              <FreeEntryForm />
            </div>
          </Reveal>

          <Reveal delay={150}>
            <p className="mx-auto mt-5 max-w-md text-center text-xs leading-relaxed text-white/40">
              Open to Australian residents 18+. One free entry per person per draw. Free entrants go in the same draw as
              members. See the{" "}
              <Link href="/draw-terms" className="font-semibold text-brand-purple-soft underline underline-offset-4 hover:text-white">
                draw terms
              </Link>
              . Prefer the perks too?{" "}
              <Link href="/membership" className="font-semibold text-brand-purple-soft underline underline-offset-4 hover:text-white">
                Become a member
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
