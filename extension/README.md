# Smiths Lead Helper (Chrome extension)

Puts a **"✨ Draft reply"** button inside Meta's Lead Centre. Highlight a
conversation, click it, and a Smiths-voice follow-up appears with a Copy button.
No tab-switching to the ops app.

## One-time setup

### 1. Add the token to Vercel (do this once)
1. Vercel → your project → **Settings → Environment Variables**.
2. Add: **Name** `AI_REPLY_EXT_TOKEN`, **Value** = the token below.
3. **Redeploy** (Deployments → latest → ⋯ → Redeploy) so it takes effect.

Token (already generated for you):

```
8bybfdeLCRfOjbvD2WDdXif3KFywE3LC
```

> If you ever want to cut off the extension, change this value in Vercel and
> redeploy — the old token stops working immediately.

### 2. Load the extension in Chrome (each computer that uses it)
1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top-right).
3. Click **Load unpacked** and select this `extension` folder.
4. Click the **Smiths Lead Helper** icon (puzzle-piece menu → pin it).
5. In the popup: leave **App URL** as `https://smithsdetailingservices.com.au`,
   paste the **token** above into **Extension token**, click **Save**.

## Using it
1. Open Meta Business Suite → **Inbox / Lead Centre**, open a conversation.
2. **Drag to highlight** the messages (this is what it reads).
3. Click **✨ Draft reply** (bottom-right).
4. Check the draft, tweak if needed, click **Copy reply**, paste into Meta, send.

*Tip: highlighting the thread is the reliable way to feed it the conversation.
If you click Draft without highlighting, it makes a best guess from the visible
messages, which is less accurate.*

## Notes
- Desktop Chrome only (not phone).
- The draft is a suggestion — always read it before sending.
- Costs a fraction of a cent per draft (uses the same AI as the in-app helper).
