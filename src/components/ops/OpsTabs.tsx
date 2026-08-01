"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/ops", label: "Dashboard" },
  { href: "/ops/stock", label: "Stocktake" },
];

export default function OpsTabs() {
  const path = usePathname() || "";
  if (path.endsWith("/login")) return null; // no tabs on the login screen

  return (
    <nav className="mx-auto flex max-w-3xl gap-2 px-4 pb-3">
      {TABS.map((t) => {
        const active = t.href === "/ops" ? path === "/ops" : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-bold transition active:scale-[0.98] ${
              active
                ? "bg-brand-green text-[#04130a] shadow-[0_6px_20px_rgba(43,255,122,0.25)]"
                : "border border-white/15 bg-white/[0.03] text-white/70 hover:border-white/30 hover:text-white"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
