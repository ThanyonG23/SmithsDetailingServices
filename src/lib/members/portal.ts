/* Shared portal content: the draws every active member is entered in, and the
   partner businesses. Keep the draw dates in sync with the membership page. */

export type PortalDraw = {
  id: string;
  title: string;
  prize: string;
  drawAt: string; // ISO
  termsHref: string;
  poster: string;
};

export const DRAWS: PortalDraw[] = [
  {
    id: "big",
    title: "The big draw",
    prize: "$1,000 cash or a $2,200 paint correction & coating",
    drawAt: "2026-09-14T12:00:00+10:00",
    termsHref: "/draw-terms",
    poster: "/media/photos/giveaway.jpg",
  },
  {
    id: "mini",
    title: "The mini draw",
    prize: "$300 cash or a $400+ detail",
    drawAt: "2026-09-21T12:00:00+10:00",
    termsHref: "/mini-draw-terms",
    poster: "/media/photos/mini-giveaway.jpg",
  },
];

/** Draws still open (draw date in the future). Every active member is in all of them. */
export function openDraws(now = Date.now()): PortalDraw[] {
  return DRAWS.filter((d) => new Date(d.drawAt).getTime() > now);
}

export type Partner = { name: string; discount: string; category: string };

// Fills in as partners are signed. Empty renders a "coming soon" state.
export const PARTNERS: Partner[] = [];
