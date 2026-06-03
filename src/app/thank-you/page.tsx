import Link from "next/link";
import { BUSINESS } from "@/lib/config";

export const metadata = { title: "Booking Confirmed | Smiths Detailing Services" };

export default function ThankYouPage() {
  return (
    <main className="brand-backdrop flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-white/12 bg-white/[0.03] p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/15 text-3xl shadow-glowG">
          ✅
        </div>
        <h1 className="mt-6 text-2xl font-black text-white">You&apos;re booked in!</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Thanks for booking with {BUSINESS.shortName}. We&apos;ve sent a confirmation email with
          your details and a calendar invite. Bring your car to our {BUSINESS.suburb} workshop at
          your booked time.
        </p>

        <div className="mt-6 rounded-2xl border border-brand-green/30 bg-brand-green/[0.06] p-4 text-sm font-bold text-brand-green">
          💯 If you&apos;re not happy, you don&apos;t pay.
        </div>

        <p className="mt-6 text-sm text-white/60">
          Need to change anything? Text or call us on{" "}
          <a href={`tel:${BUSINESS.phoneE164}`} className="font-bold text-white">
            {BUSINESS.phone}
          </a>
          .
        </p>

        <Link
          href="/"
          className="mt-8 inline-block rounded-xl border-2 border-brand-green px-6 py-3 font-black text-brand-green transition hover:bg-brand-green/10"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
