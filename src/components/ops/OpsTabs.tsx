"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/ops", label: "Dashboard" },
  { href: "/ops/analytics", label: "Analytics" },
  { href: "/ops/team", label: "Team" },
  { href: "/ops/ads", label: "Ads" },
  { href: "/ops/stock", label: "Stock" },
  { href: "/ops/crm", label: "CRM" },
  { href: "/ops/templates", label: "Templates" },
  { href: "/ops/history", label: "History" },
];

export default function OpsTabs({ role }: { role?: "owner" | "crew" | null }) {
  const path = usePathname() || "";
  if (path.endsWith("/login")) return null; // no tabs on the login screen

  // Detailers (crew) only get their Team board — never the rest of ops.
  const tabs = role === "crew" ? TABS.filter((t) => t.href === "/ops/team") : TABS;

  return (
    // Client-side navigation (fast, no full reload) + prefetch. Own z-50
    // layer so the blurred sticky header can't swallow the click.
    <nav className="relative z-50 mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((t) => {
        const active = t.href === "/ops" ? path === "/ops" : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            prefetch
            className={`shrink-0 rounded-xl px-4 py-2.5 text-center text-sm font-bold transition active:scale-[0.98] ${
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
