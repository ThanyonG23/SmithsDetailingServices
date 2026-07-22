"use client";

import { useEffect } from "react";
import {
  REF_QUERY_PARAM,
  REF_STORAGE_KEY,
  REF_TTL_DAYS,
  getTeamMember,
  refSmsHref,
} from "@/lib/referrals";

interface Stored {
  code: string;
  exp: number;
}

function read(): string | undefined {
  try {
    const raw = window.localStorage.getItem(REF_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed?.code || Date.now() > parsed.exp) {
      window.localStorage.removeItem(REF_STORAGE_KEY);
      return undefined;
    }
    return parsed.code;
  } catch {
    return undefined;
  }
}

function write(code: string): void {
  try {
    const value: Stored = {
      code,
      exp: Date.now() + REF_TTL_DAYS * 24 * 60 * 60 * 1000,
    };
    window.localStorage.setItem(REF_STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* private browsing — the link still works for this visit */
  }
}

/**
 * Mounted once in the root layout.
 *
 * Works out which detailer sent this visitor (from the /r/<code> page they
 * landed on, or ?ref=, or a previous visit), remembers it, then rewrites
 * every "Text for a Free Quote" link on the page so the code travels with
 * the customer's own text message.
 */
export default function RefTracker({ code }: { code?: string }) {
  useEffect(() => {
    let active = code;

    if (!active) {
      const fromUrl = new URLSearchParams(window.location.search).get(REF_QUERY_PARAM);
      if (fromUrl && getTeamMember(fromUrl)) active = fromUrl.toLowerCase();
    }
    if (!active) active = read();
    if (!active) return;

    write(active);

    const href = refSmsHref(active);
    const apply = () => {
      document.querySelectorAll<HTMLAnchorElement>('a[href^="sms:"]').forEach((a) => {
        a.href = href;
      });
    };

    apply();

    // Sections reveal on scroll, so re-apply if links get added later.
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [code]);

  return null;
}
