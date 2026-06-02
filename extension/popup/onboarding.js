// Mark onboarding as shown
chrome.storage.local.set({ onboardingShown: true });

const APP_URL = typeof WRITESCORE_CONFIG !== "undefined" ? WRITESCORE_CONFIG.APP_URL : "https://writescore.io";

document.getElementById("get-started-btn").addEventListener("click", () => {
  chrome.tabs.create({ url: `${APP_URL}/sign-up?source=extension-install` });
  window.close();
});
