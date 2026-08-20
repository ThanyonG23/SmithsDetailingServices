import type { Metadata } from "next";
import Link from "next/link";
import MembershipJoin from "@/components/MembershipJoin";
import { BUSINESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Join · The Smiths Detailing Membership",
  description: "Set up your Smiths Detailing membership.",
  robots: { index: false, follow: false }, // sent by hand after a call — never for search
  alternates: { canonical: "/membership/join" },
};

const LOGO = BUSINESS.logo;

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-[#050506]">
      <div className="relative mx-auto max-w-xl px-5 py-16 sm:py-20">
        <div
          className="pointer-events-none absolute left-1/2 top-24 h-[380px] w-[380px] -translate-x-1/2 rounded-full opacity-[0.2] blur-[110px]"
          style={{ background: "radial-gradient(closest-side, #2bff7a, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative">
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Smiths Detailing" className="mx-auto w-full max-w-xs" />
            <h1 className="mt-6 font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              Let&apos;s get you set up
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-white/60">
              Great to have you on board. Pop your details in and we&apos;ll text you to lock in your
              first visit.
            </p>
          </div>

          <div className="mt-8">
            <MembershipJoin />
          </div>

          <footer className="mt-12 text-center text-sm text-white/40">
            <p>{BUSINESS.address}</p>
            <Link href="/membership" className="mt-2 inline-block text-white/50 underline underline-offset-4 transition hover:text-white">
              ← Back to the membership
            </Link>
          </footer>
        </div>
      </div>
    </main>
  );
}
