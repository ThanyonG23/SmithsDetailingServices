# Smiths Detailing — Booking Website

A clean, mobile-first booking site for **Smiths Detailing Services** (Cairns).
Built with **Next.js**, **Supabase** (database) and **Resend** (email), deployed on **Vercel**.

- Customers pick vehicle → package → extras → date/time → details, see live pricing, and book.
- Every booking is saved to Supabase and emails go to **you** and **the customer** (with a calendar invite).
- No payment is taken online — you collect on the day.

---

## What you'll set up (3 free accounts)

| Service     | What it's for                          | Cost            |
| ----------- | -------------------------------------- | --------------- |
| **Supabase** | Stores your bookings (database)        | Free tier       |
| **Resend**   | Sends confirmation emails              | Free (3k/month) |
| **Vercel**   | Hosts the website + connects your domain | Free (Hobby)    |

You'll also need a free **GitHub** account (Vercel deploys from there).

> 💡 Follow the steps **in order**. Total time: ~30–45 minutes. You can do it all from a web browser.

---

## STEP 0 — Install the tools (one time, ~10 min)

1. **Install Node.js** (lets you run the project): go to <https://nodejs.org> and install the **LTS** version. Accept all defaults.
2. **Install Git**: go to <https://git-scm.com/download/win> and install. Accept all defaults.
3. **Install VS Code** (free code editor) if you don't have one: <https://code.visualstudio.com>.

To check it worked, open **PowerShell** and run:

```powershell
node -v
git --version
```

Both should print a version number.

---

## STEP 1 — Create your Supabase database (~8 min)

1. Go to <https://supabase.com> → **Start your project** → sign up (use Google/GitHub for speed).
2. Click **New project**.
   - **Name:** `smiths-detailing`
   - **Database Password:** click *Generate* and **save it somewhere safe**.
   - **Region:** choose **Sydney** (closest to Cairns).
   - Click **Create new project** and wait ~2 minutes for it to finish.
3. Create the bookings table:
   - Left menu → **SQL Editor** → **New query**.
   - Open the file `supabase/schema.sql` from this project, copy **all** of it, paste into the editor.
   - Click **Run**. You should see "Success".
4. Get your keys:
   - Left menu → **Project Settings** (gear icon) → **API**.
   - Copy these two values — you'll paste them later:
     - **Project URL** → this is `SUPABASE_URL`
     - **`service_role`** secret (click "Reveal") → this is `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ The `service_role` key is like a master password. Never share it or put it on a public page. We only use it on the server.

---

## STEP 2 — Create your Resend email account (~5 min)

1. Go to <https://resend.com> → **Sign up**.
2. Left menu → **API Keys** → **Create API Key** → name it `smiths` → **Create**.
   - Copy the key (starts with `re_`) → this is `RESEND_API_KEY`.
3. **(Recommended) Verify your domain** so emails come from `@smithsdetailingservices.com.au`:
   - Left menu → **Domains** → **Add Domain** → enter `smithsdetailingservices.com.au`.
   - Resend shows a few DNS records. Add them wherever your domain is managed (e.g. your domain registrar). Once verified, set `EMAIL_FROM` to `Smiths Detailing <bookings@smithsdetailingservices.com.au>`.
   - **Not ready to verify yet?** You can start with `EMAIL_FROM=Smiths Detailing <onboarding@resend.dev>` — emails still send, just from a Resend address. Change it later.

---

## STEP 3 — Run the site on your own computer first (~5 min)

This confirms everything works before going live.

1. Open the project folder in **PowerShell**:

   ```powershell
   cd "c:\Users\thany\OneDrive\Desktop\Last Update Shopify\smiths-detailing"
   ```

2. Install the project's parts:

   ```powershell
   npm install
   ```

3. Create your secrets file. Copy the example and open it:

   ```powershell
   Copy-Item .env.local.example .env.local
   code .env.local
   ```

   Paste in the values you collected from Supabase and Resend, then save.

4. Start it:

   ```powershell
   npm run dev
   ```

   Open <http://localhost:3000> in your browser. Try making a test booking — you should get the confirmation emails, and the booking should appear in Supabase (**Table Editor → bookings**).

   Press `Ctrl + C` in PowerShell to stop it.

---

## STEP 4 — Put the code on GitHub (~5 min)

Vercel deploys from GitHub. In PowerShell, inside the `smiths-detailing` folder:

```powershell
git init
git add .
git commit -m "Smiths Detailing booking site"
```

1. Go to <https://github.com> → sign up/log in → **New repository**.
   - Name: `smiths-detailing` → **Private** → **Create repository**.
2. GitHub shows commands under "…or push an existing repository". Copy the two lines that look like:

   ```powershell
   git remote add origin https://github.com/YOUR-USERNAME/smiths-detailing.git
   git branch -M main
   git push -u origin main
   ```

   Run them in PowerShell. (It may ask you to log in to GitHub in a popup — do that.)

---

## STEP 5 — Deploy to Vercel (~5 min)

1. Go to <https://vercel.com> → **Sign up** → choose **Continue with GitHub**.
2. **Add New… → Project** → find `smiths-detailing` → **Import**.
3. Before clicking Deploy, open **Environment Variables** and add each of these (Name → Value):

   | Name                         | Value                                                            |
   | ---------------------------- | ---------------------------------------------------------------- |
   | `SUPABASE_URL`               | your Supabase Project URL                                        |
   | `SUPABASE_SERVICE_ROLE_KEY`  | your Supabase service_role key                                   |
   | `RESEND_API_KEY`             | your Resend key (`re_…`)                                          |
   | `EMAIL_FROM`                 | `Smiths Detailing <bookings@smithsdetailingservices.com.au>` (or the `onboarding@resend.dev` one) |
   | `OWNER_EMAIL`                | `info@smithsdetailingservices.com.au`                            |
   | `NEXT_PUBLIC_SITE_URL`       | `https://smithsdetailingservices.com.au`                         |

4. Click **Deploy**. After ~1–2 minutes you'll get a live link like `smiths-detailing.vercel.app`. Test a booking on it.

---

## STEP 6 — Connect your domain (~10 min, optional but recommended)

1. In Vercel → your project → **Settings → Domains** → add `smithsdetailingservices.com.au` (and `www.`).
2. Vercel tells you which DNS records to set. Add them at your domain registrar (wherever you bought the domain). DNS can take a few minutes to a few hours to update.

> If the domain is currently pointed at Shopify, you'll switch the DNS to Vercel here. Do this when you're ready to go live.

---

## Making changes later

- **Change prices, packages or extras:** edit `src/lib/config.ts` only. That's the single source of truth for the whole site.
- **Push an update live:** in PowerShell inside the folder:

  ```powershell
  git add .
  git commit -m "describe what you changed"
  git push
  ```

  Vercel automatically redeploys within a minute or two.

---

## Where to see your bookings

For now, your bookings live in **Supabase → Table Editor → bookings**, and you get an email for every new one. When you want a proper admin dashboard (log in, see/manage/cancel bookings in a nice screen), that's the natural next add-on — just ask.

## Things you can add next (not in this version)

- SMS confirmations + next-day reminders + day-after review-request texts (needs Twilio or Telstra + a daily scheduled job).
- Admin login dashboard.
- Online deposit / full payment via Stripe.
- Google review embed + Instagram reels on the homepage.

---

## Project structure (for reference)

```
smiths-detailing/
├─ src/
│  ├─ app/
│  │  ├─ page.tsx              ← homepage
│  │  ├─ booking/page.tsx      ← booking page
│  │  ├─ thank-you/page.tsx    ← post-booking page
│  │  └─ api/
│  │     ├─ availability/route.ts  ← checks free time slots
│  │     └─ book/route.ts          ← saves booking + sends emails
│  ├─ components/BookingFlow.tsx    ← the booking wizard (UI)
│  └─ lib/
│     ├─ config.ts             ← ★ prices, packages, extras, business info
│     ├─ supabase.ts, email.ts, ics.ts, time.ts, types.ts
└─ supabase/schema.sql         ← run once in Supabase
```
