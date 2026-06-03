import type { Metadata } from "next";
import BookingFlow from "@/components/BookingFlow";

export const metadata: Metadata = {
  title: "Book Your Detail | Smiths Detailing Services — Cairns",
  description:
    "Choose your vehicle, package and extras, then pick a live available time. Mobile detailing across Cairns.",
};

export default function BookingPage() {
  return (
    <main className="brand-backdrop min-h-screen">
      <BookingFlow />
    </main>
  );
}
