# Service photos — what to upload 📸

Drop your photos **in this folder** (`public/media/photos/services/`) using the
exact filenames below. Then tell me they're in and I'll point each service at
them in `src/lib/config.ts`.

Right now every service uses a **placeholder** photo, so the site looks fine —
but these should all be replaced with your own Cairns work.

## The 7 service photos

| # | Service | Upload this filename | What works best |
|---|---------|---------------------|-----------------|
| 1 | Deep Interior Clean | `interior.jpg` | Clean interior shot — seats/carpets, ideally after a shampoo |
| 2 | Exterior Wash | `exterior-wash.jpg` | Car mid-wash with foam, or a spotless finished exterior |
| 3 | Cut & Polish | `cut-polish.jpg` | Glossy paint with reflections — sunlight or shop lights |
| 4 | Multi-Stage Paint Correction | `paint-correction.jpg` | Machine polisher on paint, or a mirror-finish panel |
| 5 | Headlight Restoration | `headlights.jpg` | Before/after headlight, or a crystal-clear restored one |
| 6 | Touch Up Paint | `touch-up.jpg` | Close-up of a repaired chip or scratch |
| 7 | Ceramic Coatings | `ceramic.jpg` | Water beading on paint — the classic ceramic shot |

## Two more that make a big difference

These are the **full-width background photos** (the very top of the page, and
the big band near the bottom). Put these in the folder **above** this one
(`public/media/photos/`):

| Filename | Where it shows | What works best |
|----------|---------------|-----------------|
| `hero.jpg` | Top of the page — first thing everyone sees | Your single best "wow" car shot, landscape, dark/moody suits the design |
| `cta.jpg` | Big band above the footer | Another strong finished-car shot |

## Tips

- **Landscape** orientation works best (roughly 4:3 or wider).
- Lowercase names, no spaces — use dashes (`cut-polish.jpg`, not `Cut Polish.jpg`).
- Keep each under ~2 MB so the page stays fast.
- `.jpg` or `.png` both fine — just tell me which you used.

After adding files: `git add .` → `git commit -m "service photos"` → `git push`,
and Vercel puts them live.
