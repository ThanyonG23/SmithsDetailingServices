# Your media folder 📸🎥

Drop your **photos** in `media/photos/` and **videos** in `media/videos/`.

Anything in this folder is served by the website. The web address of a file is
its path **after `public`**. So:

| File you add                              | Use this URL on the site   |
| ----------------------------------------- | -------------------------- |
| `public/media/photos/sedan.jpg`           | `/media/photos/sedan.jpg`  |
| `public/media/videos/reel1.mp4`           | `/media/videos/reel1.mp4`  |
| `public/media/photos/before-after-1.jpg`  | `/media/photos/before-after-1.jpg` |

## How to use them

- **Gallery / cards:** once you've added photos, tell me the file names and I'll
  point the homepage gallery, package cards, vehicle cards, etc. at them
  (they're all listed in `src/lib/config.ts`). For example a gallery photo would
  become `"/media/photos/before-after-1.jpg"`.
- **Tips:** use lowercase names with no spaces (use dashes), e.g.
  `single-cab-clean.jpg`. Keep photos under ~2 MB and videos under ~20 MB so the
  site stays fast.

> After adding files here, commit + push (`git add .`, `git commit`, `git push`)
> and Vercel will include them on the live site automatically.
