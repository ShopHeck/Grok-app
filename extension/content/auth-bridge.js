/**
 * AgentDesk Auth Bridge Content Script
 * Injected on agentdesk.app/* to pass the Supabase session to the extension.
 *
 * Flow:
 * 1. User signs in on agentdesk.app (web app)
 * 2. This content script detects the session in localStorage/cookies
 * 3. Sends SET_SESSION message to the background service worker
 * 4. Extension is now authenticated without a separate OAuth flow
 *
 * Also handles:
 * - Session refresh (when tokens are rotated)
 * - Logout detection (clears extension state)
 * - Extension install detection (shows success toast on web app)
 */

(function () {
  "use strict";

  const STORAGE_KEY = "sb-auth-token"; // Supabase auth token key pattern
  const CHECK_INTERVAL = 2000; // Check every 2 seconds
  let lastSessionHash = "";

  // ============ SESSION DETECTION ============

  function getSupabaseSession() {
    // Supabase stores auth in localStorage with key pattern: sb-<project>-auth-token
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes("-auth-token")) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || "");
          if (data?.access_token && data?.user) {
            return {
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              user: {
                id: data.user.id,
                email: data.user.email,
                plan: null, // Will be fetched by extension
              },
            };
          }
        } catch {
          // Not valid JSON, skip
        }
      }
    }
    return null;
  }

  function hashSession(session) {
    if (!session) return "";
    return session.access_token.slice(-16); // Last 16 chars as fingerprint
  }

  // ============ SEND TO EXTENSION ============

  function sendSessionToExtension(session) {
    if (!chrome?.runtime?.id) return; // Extension not installed

    try {
      chrome.runtime.sendMessage(
        {
          type: "SET_SESSION",
          session: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          },
          user: session.user,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            // Extension not installed or not responding — that's OK
            return;
          }
          if (response?.success) {
            showExtensionSyncToast("success");
          }
        }
      );
    } catch {
      // Extension not available
    }
  }

  function sendLogoutToExtension() {
    if (!chrome?.runtime?.id) return;

    try {
      chrome.runtime.sendMessage({ type: "LOGOUT" }, () => {
        if (chrome.runtime.lastError) return;
      });
    } catch {
      // Extension not available
    }
  }

  // ============ POLLING LOOP ============

  function checkSession() {
    const session = getSupabaseSession();
    const currentHash = hashSession(session);

    if (currentHash !== lastSessionHash) {
      lastSessionHash = currentHash;

      if (session) {
        sendSessionToExtension(session);
      } else if (lastSessionHash !== "") {
        // Session was removed → user logged out
        sendLogoutToExtension();
      }
    }
  }

  // Initial check
  checkSession();

  // Periodic check (catches token refresh, login, logout)
  setInterval(checkSession, CHECK_INTERVAL);

  // Also listen for storage events (login/logout in another tab)
  window.addEventListener("storage", (e) => {
    if (e.key && e.key.includes("auth-token")) {
      setTimeout(checkSession, 500);
    }
  });

  // ============ URL-BASED TRIGGERS ============

  // If user just signed in (redirected with ?source=extension)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("source") === "extension") {
    // Wait a moment for Supabase to populate localStorage
    setTimeout(() => {
      checkSession();
      showExtensionSyncToast("connected");
    }, 1500);
  }

  // ============ UI FEEDBACK ============

  function showExtensionSyncToast(type) {
    // Don't show toast if one already exists
    if (document.getElementById("agentdesk-ext-toast")) return;

    const messages = {
      success: "✓ Extension synced — you're signed in!",
      connected: "✓ Chrome Extension connected! You can close this tab.",
    };

    const toast = document.createElement("div");
    toast.id = "agentdesk-ext-toast";
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
      padding: 12px 20px;
      background: #10b981;
      color: white;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: agentdesk-slide-up 0.3s ease;
    `;
    toast.textContent = messages[type] || messages.success;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ============ EXTENSION INSTALL DETECTION ============

  // If the web app page has a data attribute indicating extension should connect
  if (document.documentElement.dataset.agentdeskExtensionExpected) {
    if (chrome?.runtime?.id) {
      document.documentElement.dataset.agentdeskExtensionInstalled = "true";
    }
  }
})();
