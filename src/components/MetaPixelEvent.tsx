"use client";

import { useEffect } from "react";

/* Fires a Meta pixel standard event once on mount. Drop it on a page that
   represents a conversion (e.g. the post-payment thank-you pages). */
export default function MetaPixelEvent({ event = "Lead" }: { event?: string }) {
  useEffect(() => {
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
    if (typeof fbq === "function") fbq("track", event);
  }, [event]);
  return null;
}
