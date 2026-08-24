/* =====================================================================
   SMITHS DETAILING, TRAINING PORTAL CONTENT
   ---------------------------------------------------------------------
   This is where every SOP / process module lives. To add training:
     1. Add a module to TRAINING below (or a lesson to an existing one).
     2. For a video, paste a YouTube / Loom / Vimeo share link into `video`
       , it embeds automatically.
     3. Use `steps` for a numbered SOP, `body` for explanation (blank lines
        = new paragraphs). Both are optional.
   Everything is version-controlled and shows up instantly at /ops/training.
   The starter modules below are scaffolding, replace the copy with the
   real thing as you build it out.
   ===================================================================== */

export type TrainingRole = "detailer" | "admin" | "all";

export interface Lesson {
  title: string;
  duration?: string; // e.g. "6 min"
  video?: string; // paste a YouTube / Loom / Vimeo link
  body?: string; // free text; blank lines separate paragraphs
  steps?: string[]; // numbered SOP steps
}

export interface TrainingModule {
  slug: string; // url-safe id, must be unique
  title: string;
  role: TrainingRole;
  emoji: string;
  summary: string;
  lessons: Lesson[];
}

export const ROLE_LABEL: Record<TrainingRole, string> = {
  detailer: "Detailer",
  admin: "Admin",
  all: "Everyone",
};

/** Turn a YouTube / Loom / Vimeo share link into an embeddable URL, or null
    (then the page just shows a "Watch ↗" link out). */
export function embedUrl(url?: string): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const loom = url.match(/loom\.com\/(?:share|embed)\/([\w-]+)/);
  if (loom) return `https://www.loom.com/embed/${loom[1]}`;
  const vim = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vim) return `https://player.vimeo.com/video/${vim[1]}`;
  return null;
}

export function lessonCount(m: TrainingModule): number {
  return m.lessons.length;
}
export function getModule(slug: string): TrainingModule | undefined {
  return TRAINING.find((m) => m.slug === slug);
}

/* ---------------------------------------------------------------------
   THE MODULES. Add / edit freely, this array is the whole portal.
   --------------------------------------------------------------------- */
export const TRAINING: TrainingModule[] = [
  {
    slug: "welcome",
    title: "Start here, Welcome to Smiths",
    role: "all",
    emoji: "👋",
    summary: "Who we are, the standard we hold, and the one promise we never break.",
    lessons: [
      {
        title: "What Smiths stands for",
        duration: "3 min",
        body:
          "We do the best detail in Cairns and we stand behind it. Every car leaves looking like the owner's proud of it again.\n\nOur promise to every customer: if you're not happy, you don't pay. That's not a slogan, it's the bar. Quality-check every car like it's going back to your own driveway.",
      },
      {
        title: "The packages, top to bottom",
        duration: "5 min",
        body:
          "Interior Only · Premium Detail · Premium + Polish · Premium + Cut & Polish · Correction & Coating (our flagship). Know what each one includes and roughly how long it takes, the target hours live on the Scoreboard.\n\n[Add: a short walk-through of each package and what's involved.]",
      },
    ],
  },
  {
    slug: "correction-coating",
    title: "The Correction & Coating process",
    role: "detailer",
    emoji: "✨",
    summary: "Our flagship job, start to finish. A 20-hour job done right, every time.",
    lessons: [
      {
        title: "Overview & the standard",
        duration: "8 min",
        video: "",
        body:
          "The Correction & Coating is a ~20 hour job (add extras: headlights +1.5h, touch-up +1h). It's our highest-value work and where our reputation is made.\n\n[Add your walk-through video and notes here.]",
      },
      {
        title: "Step-by-step SOP",
        steps: [
          "Contact wash & wheels",
          "Decontamination wash",
          "Clay bar treatment",
          "Multi-stage paint correction",
          "Panel wipe / inspect under lights",
          "Apply the ceramic coating",
          "Free premium interior detail (bonus inclusion)",
          "Final quality check under lights before handover",
        ],
      },
    ],
  },
  {
    slug: "team-board",
    title: "Using the Team Board & clocking on",
    role: "detailer",
    emoji: "⏱️",
    summary: "How to clock on/off each car, and why it matters for your bonus.",
    lessons: [
      {
        title: "Clock on, clock off, every car",
        duration: "4 min",
        body:
          "Open the Team board, tap your name, then Start on the car you're working. Tap Stop when you move off it. That's it.\n\nWhy it matters: your times per car build the 'time left' on each job and, once bonuses launch, decide the crew pool. Beating the clock is how you earn it. Left-running timers hurt everyone's numbers, so stop the clock when you step away.",
      },
    ],
  },
  {
    slug: "quality-check",
    title: "The Quality Check",
    role: "detailer",
    emoji: "🔦",
    summary: "The final look before any car goes back, the last line before the guarantee.",
    lessons: [
      {
        title: "The handover checklist",
        steps: [
          "Inspect the paint under proper lighting for missed swirls / holograms",
          "Glass streak-free inside and out",
          "No product residue in trim, badges, or shuts",
          "Wheels, tyres and arches clean and dressed",
          "Interior: no dust in vents, seats and mats done",
          "Walk it with fresh eyes, would you pay for this?",
        ],
      },
    ],
  },
  {
    slug: "admin-daily-ops",
    title: "Admin, Daily ops, open to close",
    role: "admin",
    emoji: "📋",
    summary: "Running the day from the ops manager: open, run the floor, close it out.",
    lessons: [
      {
        title: "The daily run sheet",
        duration: "6 min",
        body:
          "The dashboard run sheet is the spine of the day, open, set up the detailers, run the floor, answer leads fast, quality-check, take payment, then the close steps that keep the board (and the business) honest.\n\n[Add: a screen-share walking through open → close.]",
      },
      {
        title: "End-of-day: log, calendar, ads, stock",
        steps: [
          "Log the day on the dashboard (revenue, jobs, leads)",
          "Upload the Google Calendar export",
          "Upload the ad data on the Ads tab",
          "Update the stocktake, order anything low",
          "Fill tomorrow and set the crew",
        ],
      },
    ],
  },
];
