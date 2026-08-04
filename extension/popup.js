const appUrlEl = document.getElementById("appUrl");
const tokenEl = document.getElementById("token");
const savedEl = document.getElementById("saved");

chrome.storage.sync.get(["appUrl", "token"], ({ appUrl, token }) => {
  appUrlEl.value = appUrl || "https://smithsdetailingservices.com.au";
  tokenEl.value = token || "";
});

document.getElementById("save").addEventListener("click", () => {
  const appUrl = (appUrlEl.value || "").trim().replace(/\/+$/, "");
  const token = (tokenEl.value || "").trim();
  chrome.storage.sync.set({ appUrl, token }, () => {
    savedEl.textContent = "Saved ✓";
    setTimeout(() => (savedEl.textContent = ""), 1500);
  });
});
