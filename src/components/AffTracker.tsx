"use client";

import { useEffect } from "react";

/* Stores the affiliate code in a cookie for 90 days so it survives the whole
   funnel (membership -> /upgrade -> Stripe). /upgrade reads this cookie and
   pre-applies the affiliate's promo code at checkout, which is how the referred
   member gets attributed to the affiliate. Renders nothing. */
export default function AffTracker({ code }: { code: string }) {
  useEffect(() => {
    try {
      const maxAge = 60 * 60 * 24 * 90; // 90 days
      document.cookie = `smiths_aff=${encodeURIComponent(code)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    } catch {
      /* ignore */
    }
  }, [code]);
  return null;
}
