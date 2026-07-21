import { SERVICES, TEXT_TO_BOOK_HREF, type ServiceDef } from "@/lib/config";
import Reveal from "./Reveal";

/* Alternating service sections: eyebrow → big headline with a coloured
   accent → subhead, paired with a photo card whose checklist staggers in
   as you scroll. Columns swap sides each row so the page has rhythm
   instead of one flat column. */

const ACCENT = {
  yellow: {
    text: "text-brand-yellow",
    pillBg: "bg-brand-yellow/10",
    pillBorder: "border-brand-yellow/35",
    cardBorder: "border-brand-yellow/25",
    halo: "halo-yellow",
  },
  green: {
    text: "text-brand-green",
    pillBg: "bg-brand-green/10",
    pillBorder: "border-brand-green/35",
    cardBorder: "border-brand-green/25",
    halo: "halo-green",
  },
} as const;

export default function ServiceShowcase() {
  return (
    <div className="space-y-24 sm:space-y-32">
      {SERVICES.map((service, i) => (
        <ServiceSection key={service.key} service={service} flip={i % 2 === 1} />
      ))}
    </div>
  );
}

function ServiceSection({ service, flip }: { service: ServiceDef; flip: boolean }) {
  const a = ACCENT[service.accent];

  return (
    <section className="mx-auto w-full max-w-6xl px-4">
      <div
        className={`flex flex-col items-center gap-10 md:gap-14 ${
          flip ? "md:flex-row-reverse" : "md:flex-row"
        }`}
      >
        {/* ── Text column ── */}
        <div className="w-full min-w-0 md:flex-1">
          <Reveal>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
              {service.eyebrow}
            </div>
            <h3 className="mt-3 font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
              {service.headline}
              <br />
              <span className={a.text}>{service.accentWord}</span>
            </h3>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/65 sm:text-base">
              {service.desc}
            </p>
            <a
              href={TEXT_TO_BOOK_HREF}
              className="mt-7 inline-flex items-center gap-2 text-sm font-black text-white transition hover:gap-3"
            >
              <span className={a.text}>Text for a free quote</span>
              <span className={a.text}>→</span>
            </a>
          </Reveal>
        </div>

        {/* ── Visual column ── */}
        <div className="w-full min-w-0 md:flex-1">
          <Reveal delay={120}>
            <div className="relative">
              {/* soft accent halo behind the card */}
              <div
                className={`pointer-events-none absolute -inset-10 ${a.halo}`}
                aria-hidden
              />

              <div className="relative">
                {/* surface pill */}
                <div
                  className={`mb-4 inline-flex items-center gap-2 rounded-full border ${a.pillBorder} ${a.pillBg} px-3 py-1.5`}
                >
                  <span
                    className={`text-[10px] font-black uppercase tracking-[0.18em] ${a.text}`}
                  >
                    {service.name}
                  </span>
                </div>

                {/* photo + checklist card */}
                <div
                  className={`group overflow-hidden rounded-3xl border ${a.cardBorder} bg-black/60 backdrop-blur-sm`}
                >
                  <div className="shine relative aspect-[4/3] overflow-hidden">
                    <div
                      className="photo-zoom absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${service.image})` }}
                      role="img"
                      aria-label={service.name}
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent"
                      aria-hidden
                    />
                  </div>

                  <ul className="space-y-3 p-5 sm:p-6">
                    {service.steps.map((step, i) => (
                      <Reveal
                        as="li"
                        key={step}
                        delay={150 * (i + 1)}
                        className="flex items-start gap-2.5 text-sm leading-snug text-white/85"
                      >
                        <span className={`mt-px shrink-0 font-black ${a.text}`}>✓</span>
                        <span>{step}</span>
                      </Reveal>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
