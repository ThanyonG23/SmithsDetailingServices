/* =====================================================================
   DETAILER REFERRAL LINKS
   ---------------------------------------------------------------------
   Every detailer gets their own link, e.g.

       smithsdetailingservices.com.au/r/jake

   That link opens the normal website. The only difference is that every
   "Text for a Free Quote" button on the page pre-fills the customer's
   message with the detailer's code:

       Hey Smiths! I'd like a free quote. (Ref: JAKE)

   So the code arrives in your inbox on the customer's own text — no
   tracking pixels, no cookies to trust, no extra software. Copy it into
   the calendar booking as `Source: JAKE` and that becomes your
   commission ledger at the end of the month.

   TO ADD A DETAILER: add a line to TEAM below, push, done.
   ===================================================================== */

import { BUSINESS, TEXT_TO_BOOK_MESSAGE } from "./config";

export interface TeamMember {
  /** Lowercase, no spaces — this becomes the URL: /r/jake */
  code: string;
  /** First name, shown on their landing page */
  name: string;
  /** Their Instagram/TikTok handle without the @ (optional) */
  handle?: string;
  /** Their personal OneDrive folder for raw clips. These are edit links —
      treat them like passwords. Re-share the folder in OneDrive to kill an
      old link and generate a new one. */
  footageUrl?: string;
  /** Set true once they've left. Their old links stay alive so posts still
      out in the world keep converting — you just stop paying commission.
      NEVER delete a code and NEVER reassign it to someone else, or your
      commission history stops being auditable. */
  retired?: boolean;
}

/* To add a detailer: one line here, push, their link is live.
   Keep codes short, lowercase and obviously theirs. */
export const TEAM: TeamMember[] = [
  {
    code: "federica",
    name: "Federica",
    handle: "federica.smithsdetailing",
    footageUrl:
      "https://1drv.ms/f/c/9ca96e60befd2607/IgAgbWj9twbgT6Esndx6dh_JAbpZ_BGSoO6h8EA25D0i1Io?e=CCSZ8k",
  },
  {
    code: "yanis",
    name: "Yanis",
    handle: "yanis.smithsdetailing",
    footageUrl:
      "https://1drv.ms/f/c/9ca96e60befd2607/IgAu1AIC9xeyTJvTY4RKqBu8AVFHKHXNKilTd07rTIMpBH0?e=kZowKK",
  },
  {
    code: "laura",
    name: "Laura",
    handle: "laura.smithsdetailing",
    footageUrl:
      "https://1drv.ms/f/c/9ca96e60befd2607/IgBEwbh4OErDR5SflSxFONXLAXBl9LExV5pVIDXiNQkq2Rw?e=VhWb0D",
  },
];

/** Everyone currently earning commission. */
export const ACTIVE_TEAM = TEAM.filter((m) => !m.retired);

export function getTeamMember(code: string): TeamMember | undefined {
  const c = String(code || "").toLowerCase();
  return TEAM.find((m) => m.code === c);
}

/** How long a click is remembered on the customer's phone. */
export const REF_TTL_DAYS = 90;
export const REF_STORAGE_KEY = "smiths_ref";
export const REF_QUERY_PARAM = "ref";

/** The pre-filled text message, with the referral code tagged onto the
    first line so it survives the customer typing in the blanks below. */
export function refMessage(code?: string): string {
  if (!code) return TEXT_TO_BOOK_MESSAGE;
  const lines = TEXT_TO_BOOK_MESSAGE.split("\n");
  lines[0] = `${lines[0]} (Ref: ${code.toUpperCase()})`;
  return lines.join("\n");
}

export function refSmsHref(code?: string): string {
  return (
    "sms:" + BUSINESS.phoneE164 + "?&body=" + encodeURIComponent(refMessage(code))
  );
}
