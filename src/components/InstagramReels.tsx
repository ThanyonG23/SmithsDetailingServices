"use client";

import { useEffect } from "react";

/* Embeds the partner-proof reels inline via Instagram's official embed.js.
   Renders each real post as its own player with a style label above it, so a
   business can watch the range of content on-page without leaving. */

const REELS: { style: string; url: string }[] = [
  { style: "Educational", url: "https://www.instagram.com/reel/Dc-edEDBr0K/" },
  { style: "Community", url: "https://www.instagram.com/reel/DZhYFJJB-bq/" },
  { style: "Skit", url: "https://www.instagram.com/reel/DM63YEQBFYC/" },
  { style: "Comedy", url: "https://www.instagram.com/reel/DLIdw5nB_np/" },
  { style: "Giveaway", url: "https://www.instagram.com/reel/DKbDeeYBaxl/" },
  { style: "Trend", url: "https://www.instagram.com/reel/DHU45AkqI2u/" },
];

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

export default function InstagramReels() {
  useEffect(() => {
    const existing = document.getElementById("ig-embed-js") as HTMLScriptElement | null;
    if (existing) {
      window.instgrm?.Embeds.process();
      return;
    }
    const s = document.createElement("script");
    s.id = "ig-embed-js";
    s.src = "https://www.instagram.com/embed.js";
    s.async = true;
    s.onload = () => window.instgrm?.Embeds.process();
    document.body.appendChild(s);
  }, []);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {REELS.map((r) => (
        <div key={r.url}>
          <div className="mb-2 text-center text-[11px] font-black uppercase tracking-[0.16em] text-brand-purple-soft">
            {r.style}
          </div>
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={r.url}
            data-instgrm-version="14"
            style={{ background: "#FFF", border: 0, borderRadius: 12, margin: "0 auto", maxWidth: 540, width: "100%" }}
          />
        </div>
      ))}
    </div>
  );
}
