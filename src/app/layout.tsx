import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Sora({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://smithsdetailingservices.com.au";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Smiths Detailing Services | Premium Car Detailing — Smithfield, Cairns",
  description:
    "Premium car detailing in Smithfield, Cairns. Interior & exterior detailing and cut & polish, done at our workshop. Book online in minutes. If you're not happy, you don't pay.",
  openGraph: {
    title: "Smiths Detailing Services | Premium Car Detailing — Smithfield, Cairns",
    description:
      "Premium car detailing in Smithfield, Cairns. Book online in minutes. If you're not happy, you don't pay.",
    url: SITE_URL,
    siteName: "Smiths Detailing Services",
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#070708",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
