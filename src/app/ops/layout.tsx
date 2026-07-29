import type { Metadata } from "next";

/* Unlisted, like the team page — nothing links here and it's noindex,
   so the only way in is the direct link + the shared password. */
export const metadata: Metadata = {
  title: "Daily Ops | Smiths Detailing",
  robots: { index: false, follow: false, nocache: true },
};

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#050506] text-white">{children}</div>;
}
