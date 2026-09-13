"use client";

import { useEffect, useState } from "react";

/* Sticky "Book a free call" button for the partners page. Appears once the
   visitor has scrolled into the offer, and hides itself when the contact form
   is on screen so it never covers it. Scrolls to the qualifying form (#contact). */
export default function PartnerCallCTA() {
  const [scrolled, setScrolled] = useState(false);
  const [atContact, setAtContact] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    let io: IntersectionObserver | undefined;
    const contact = document.getElementById("contact");
    if (contact) {
      io = new IntersectionObserver(([e]) => setAtContact(e.isIntersecting), { threshold: 0.15 });
      io.observe(contact);
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);

  if (!scrolled || atContact) return null;

  return (
    <a
      href="#contact"
      className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-purple px-7 py-3.5 font-display text-sm font-black uppercase tracking-[0.1em] text-white shadow-[0_12px_40px_-8px_rgba(124,47,245,0.9)] transition hover:brightness-110 active:scale-95"
    >
      📞 Book a free call →
    </a>
  );
}
