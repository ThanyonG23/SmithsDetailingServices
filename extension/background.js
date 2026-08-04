// Service worker: the one place allowed to call the Smiths app cross-origin.
// The content script (running on Meta's site) sends it the thread text; it
// forwards to /api/ai-reply with the shared token and returns the draft.

async function getSettings() {
  const { appUrl, token } = await chrome.storage.sync.get(["appUrl", "token"]);
  return {
    appUrl: (appUrl || "https://smithsdetailingservices.com.au").replace(/\/+$/, ""),
    token: token || "",
  };
}

async function draft(thread) {
  const { appUrl, token } = await getSettings();
  if (!token) {
    return { error: "Set the extension token first (click the Smiths icon up top)." };
  }
  let r;
  try {
    r = await fetch(`${appUrl}/api/ai-reply`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-ext-token": token },
      body: JSON.stringify({ thread }),
    });
  } catch (e) {
    return { error: "Couldn't reach the app. Check the App URL in settings. " + (e && e.message ? e.message : "") };
  }
  let data = {};
  try {
    data = await r.json();
  } catch {
    /* non-JSON */
  }
  if (!r.ok) {
    return { error: data.error || `Server said ${r.status}. Check the token in settings.` };
  }
  return { reply: data.reply || "", read: data.read || "" };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === "DRAFT_REPLY") {
    draft(String(msg.thread || "")).then(sendResponse);
    return true; // keep the channel open for the async reply
  }
});
