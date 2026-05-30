// Mark onboarding as shown
chrome.storage.local.set({ onboardingShown: true });

const APP_URL = typeof AGENTDESK_CONFIG !== "undefined" ? AGENTDESK_CONFIG.APP_URL : "https://grok-app-eta.vercel.app";

document.getElementById("get-started-btn").addEventListener("click", () => {
  chrome.tabs.create({ url: `${APP_URL}/sign-up?source=extension-install` });
  window.close();
});
