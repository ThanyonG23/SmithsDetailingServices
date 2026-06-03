import type { VehicleKey, PackageKey } from "./config";

/** What the browser sends to POST /api/book */
export interface BookingRequest {
  vehicle: VehicleKey;
  package: PackageKey;
  date: string; // YYYY-MM-DD (Cairns local)
  slot: "0700" | "1130";
  extras: string[]; // extra keys, e.g. ["dog","engine"]
  customer: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
  attribution?: Record<string, string>;
}

/** A priced extra after the server recalculates it. */
export interface PricedExtra {
  key: string;
  label: string;
  price: number;
}

/** The fully-resolved booking the server works with (and emails about). */
export interface ResolvedBooking {
  bookingId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  vehicle: VehicleKey;
  packageKey: PackageKey;
  packageName: string;
  durationMin: number;
  slot: string;
  start: Date;
  end: Date;
  extras: PricedExtra[];
  extrasTotal: number;
  basePrice: number;
  totalPrice: number;
}
