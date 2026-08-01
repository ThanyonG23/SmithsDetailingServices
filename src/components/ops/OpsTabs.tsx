"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/ops", label: "Dashboard" },
  { href: "/ops/stock", label: "Stock" },
];

export default function OpsTabs() {
  const path = usePathname() || "";
  if (path.endsWith("/login")) return null; // no tabs on the login screen

  return (
    <nav className="mx-auto flex max-w-3xl gap-1.5 px-4 pb-2.5">
      {TABS.map((t) => {
        const active = t.href === "/ops" ? path === "/ops" : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              active
                ? "bg-brand-green text-[#04130a]"
                : "border border-white/12 text-white/60 hover:text-white"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
