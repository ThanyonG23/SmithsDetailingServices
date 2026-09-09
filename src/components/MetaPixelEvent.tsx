"use client";

import { useEffect } from "react";

/* Fires a Meta pixel standard event once on mount. Drop it on a page that
   represents a conversion (e.g. the post-payment thank-you pages).

   The base pixel loads with strategy="afterInteractive", so on a fresh page
   load `fbq` often isn't defined yet when this mounts. We poll briefly until
   it exists, then fire, so the event never gets silently dropped. */
export default function MetaPixelEvent({ event = "Lead" }: { event?: string }) {
  useEffect(() => {
    const fire = () => {
      const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
      if (typeof fbq === "function") {
        fbq("track", event);
        return true;
      }
      return false;
    };

    if (fire()) return;

    // fbq not ready yet — wait for the pixel script to initialise.
    const id = setInterval(() => {
      if (fire()) clearInterval(id);
    }, 300);
    const timeout = setTimeout(() => clearInterval(id), 10000);

    return () => {
      clearInterval(id);
      clearTimeout(timeout);
    };
  }, [event]);

  return null;
}
