// Injected into Meta Business Suite / Facebook. Adds a floating "Draft reply"
// button. It reads whatever you've highlighted in the open conversation (or, if
// nothing is highlighted, its best guess at the visible thread), asks the app
// for a Smiths-voice follow-up, and shows it in a panel with a Copy button.
// Nothing is scraped or sent unless you click.

(function () {
  if (window.__smithsLeadHelper) return; // don't double-inject on SPA navigations
  window.__smithsLeadHelper = true;

  const $ = (tag, cls) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
  };

  // ---- floating button -------------------------------------------------
  const btn = $("button", "smiths-lh-btn");
  btn.textContent = "✨ Draft reply";
  btn.title = "Highlight the conversation, then click to draft a Smiths-voice reply";
  document.body.appendChild(btn);

  // ---- panel -----------------------------------------------------------
  const panel = $("div", "smiths-lh-panel");
  panel.style.display = "none";
  panel.innerHTML = `
    <div class="smiths-lh-head">
      <span class="smiths-lh-title">Smiths follow-up</span>
      <button class="smiths-lh-x" title="Close">✕</button>
    </div>
    <div class="smiths-lh-body">
      <div class="smiths-lh-status"></div>
      <textarea class="smiths-lh-reply" rows="5" spellcheck="false"></textarea>
      <div class="smiths-lh-read"></div>
      <div class="smiths-lh-actions">
        <button class="smiths-lh-copy">Copy reply</button>
        <button class="smiths-lh-redo">Redraft</button>
      </div>
    </div>`;
  document.body.appendChild(panel);

  const statusEl = panel.querySelector(".smiths-lh-status");
  const replyEl = panel.querySelector(".smiths-lh-reply");
  const readEl = panel.querySelector(".smiths-lh-read");
  const copyBtn = panel.querySelector(".smiths-lh-copy");
  const redoBtn = panel.querySelector(".smiths-lh-redo");

  panel.querySelector(".smiths-lh-x").addEventListener("click", () => {
    panel.style.display = "none";
  });

  // ---- grab the conversation text --------------------------------------
  function grabThread() {
    // 1. Prefer what the user highlighted — robust to Meta's changing markup.
    const sel = String(window.getSelection ? window.getSelection().toString() : "").trim();
    if (sel.length > 20) return sel;
    // 2. Fallback: best-effort read of the main message area's visible text.
    const guess =
      document.querySelector('[role="main"]') ||
      document.querySelector('[aria-label*="Messages" i]') ||
      document.querySelector('[data-pagelet*="Message" i]');
    const text = guess ? (guess.innerText || "").trim() : "";
    return text.slice(-6000); // keep the most recent part of a long thread
  }

  function setStatus(msg, kind) {
    statusEl.textContent = msg || "";
    statusEl.className = "smiths-lh-status" + (kind ? " " + kind : "");
  }

  let lastThread = "";
  function run() {
    const thread = grabThread();
    if (!thread || thread.length < 20) {
      panel.style.display = "block";
      replyEl.value = "";
      readEl.textContent = "";
      setStatus("Highlight the conversation first (drag over the messages), then click Draft.", "warn");
      return;
    }
    lastThread = thread;
    panel.style.display = "block";
    replyEl.value = "";
    readEl.textContent = "";
    setStatus("Drafting…", "");
    btn.disabled = true;
    chrome.runtime.sendMessage({ type: "DRAFT_REPLY", thread }, (resp) => {
      btn.disabled = false;
      if (chrome.runtime.lastError || !resp) {
        setStatus("Something went wrong. Reload the page and try again.", "err");
        return;
      }
      if (resp.error) {
        setStatus(resp.error, "err");
        return;
      }
      setStatus("Ready, check it then copy.", "ok");
      replyEl.value = resp.reply || "";
      readEl.textContent = resp.read ? "Why: " + resp.read : "";
      autosize();
    });
  }

  function autosize() {
    replyEl.style.height = "auto";
    replyEl.style.height = Math.min(replyEl.scrollHeight + 2, 260) + "px";
  }
  replyEl.addEventListener("input", autosize);

  btn.addEventListener("click", run);
  redoBtn.addEventListener("click", () => {
    if (lastThread) {
      setStatus("Redrafting…", "");
      btn.disabled = true;
      chrome.runtime.sendMessage({ type: "DRAFT_REPLY", thread: lastThread }, (resp) => {
        btn.disabled = false;
        if (resp && resp.reply) {
          replyEl.value = resp.reply;
          readEl.textContent = resp.read ? "Why: " + resp.read : "";
          setStatus("Ready, check it then copy.", "ok");
          autosize();
        } else {
          setStatus((resp && resp.error) || "Try again.", "err");
        }
      });
    } else {
      run();
    }
  });

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(replyEl.value);
      copyBtn.textContent = "Copied ✓";
      setTimeout(() => (copyBtn.textContent = "Copy reply"), 1400);
    } catch {
      replyEl.select();
      document.execCommand("copy");
      copyBtn.textContent = "Copied ✓";
      setTimeout(() => (copyBtn.textContent = "Copy reply"), 1400);
    }
  });
})();
