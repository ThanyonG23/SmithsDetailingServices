import Link from "next/link";
import Countdown from "@/components/Countdown";

/* Shared members' draw card: poster, countdown, Join for $1 and a terms link.
   Used on the membership page and the clubhouse page so they stay identical. */

// Routes to the pre-purchase choice page (/upgrade), where they pick $1 or Platinum.
const JOIN_1_URL = "/upgrade";

export default function DrawCard({
  poster,
  alt,
  label,
  title,
  blurb,
  target,
  termsHref,
}: {
  poster: string;
  alt: string;
  label: string;
  title: React.ReactNode;
  blurb: React.ReactNode;
  target: string;
  termsHref: string;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-purple/40 shadow-[0_0_0_1px_rgba(124,47,245,0.2),0_0_55px_rgba(124,47,245,0.32)]">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt={alt} className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col bg-gradient-to-br from-brand-purple/[0.16] to-brand-purple/[0.02] p-5 sm:p-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-purple-soft">{label}</div>
        <h3 className="mt-1.5 min-h-[3.25rem] font-display text-xl font-extrabold leading-tight text-white sm:min-h-[3.75rem] sm:text-2xl">
          {title}
        </h3>
        <p className="mt-2 min-h-[2.5rem] text-sm leading-relaxed text-white/70">{blurb}</p>
        <div className="mt-auto pt-4">
          <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-red-400">Draw closes in</div>
          <Countdown target={target} accent="red" />
          <a
            href={JOIN_1_URL}
            className="mt-3 flex w-full items-center justify-center rounded-full bg-brand-purple px-6 py-3 font-display text-sm font-black text-white transition hover:brightness-110 active:scale-95"
          >
            Join for $1 →
          </a>
          <Link
            href={termsHref}
            className="mt-2.5 block text-center text-xs font-semibold text-brand-purple-soft underline underline-offset-4 transition hover:text-white"
          >
            See draw terms
          </Link>
          <p className="mt-2 text-center text-[11px] text-white/45">Join for $1. Hate it? Cancel in 10 seconds.</p>
        </div>
      </div>
    </div>
  );
}
