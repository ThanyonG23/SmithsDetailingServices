import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/config";
import OpsTabs from "@/components/ops/OpsTabs";

/* Unlisted, like the team page — nothing links here and it's noindex,
   so the only way in is the direct link + the shared password. */
export const metadata: Metadata = {
  title: "Daily Ops | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="brand-backdrop min-h-screen bg-[#050506] text-white">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" aria-label="Smiths Detailing home" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BUSINESS.logo} alt={BUSINESS.name} className="h-9 w-auto sm:h-10" />
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
            Smiths Ops
          </span>
        </div>
        <OpsTabs />
      </header>
      {children}
    </div>
  );
}
