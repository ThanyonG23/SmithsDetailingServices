import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://smithsdetailingservices.com.au";

/* Served at /sitemap.xml — the list of public pages we want Google to index.
   Only the homepage is indexable: the ops manager + API are robots-disallowed,
   and /privacy + /terms are deliberately noindex (kept live for the footer and
   ad platforms). Add new public pages here as the site grows. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [{ url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 }];
}
