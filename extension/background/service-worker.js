/**
 * AgentDesk Extension Background Service Worker
 * Handles: context menus, API communication, auth state, alarms
 */

const API_BASE = "https://agentdesk.app";

// ============ CONTEXT MENUS ============

chrome.runtime.onInstalled.addListener((details) => {
  // Show onboarding on first install
  if (details.reason === "install") {
    chrome.storage.local.get(["onboardingShown"], (data) => {
      if (!data.onboardingShown) {
        chrome.tabs.create({ url: chrome.runtime.getURL("popup/onboarding.html") });
      }
    });
  }

  chrome.contextMenus.create({
    id: "agentdesk-analyze",
    title: "Analyze with AgentDesk",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "agentdesk-analyze-email",
    title: "📬 Score as Cold Email",
    parentId: "agentdesk-analyze",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "agentdesk-analyze-social",
    title: "📱 Score as Social Post",
    parentId: "agentdesk-analyze",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "agentdesk-analyze-newsletter",
    title: "📧 Score as Newsletter",
    parentId: "agentdesk-analyze",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "agentdesk-analyze-support",
    title: "💬 Score as Support Reply",
    parentId: "agentdesk-analyze",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "agentdesk-analyze-ad",
    title: "🎯 Score as Ad Copy",
    parentId: "agentdesk-analyze",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "agentdesk-analyze-listing",
    title: "🏷️ Score as Listing",
    parentId: "agentdesk-analyze",
    contexts: ["selection"],
  });

  // Set up daily alarm for streak tracking
  chrome.alarms.create("streak-check", { periodInMinutes: 60 });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.menuItemId.startsWith("agentdesk-analyze")) return;

  const selectedText = info.selectionText;
  if (!selectedText || selectedText.trim().length === 0) return;

  const agentMap = {
    "agentdesk-analyze-email": "cold-email-grader",
    "agentdesk-analyze-social": "social-post-optimizer",
    "agentdesk-analyze-newsletter": "newsletter-grader",
    "agentdesk-analyze-support": "support-response-grader",
    "agentdesk-analyze-ad": "ad-copy-grader",
    "agentdesk-analyze-listing": "listing-optimizer",
  };

  const agentId = agentMap[info.menuItemId] || "cold-email-grader";

  // Send analyzing indicator to content script
  chrome.tabs.sendMessage(tab.id, {
    type: "SHOW_ANALYZING",
    agentId,
  });

  try {
    const result = await runAnalysis(selectedText, agentId);
    chrome.tabs.sendMessage(tab.id, {
      type: "SHOW_RESULT",
      result,
      agentId,
    });
  } catch (error) {
    chrome.tabs.sendMessage(tab.id, {
      type: "SHOW_ERROR",
      error: error.message,
    });
  }
});

// ============ MESSAGE HANDLING ============

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ANALYZE") {
    handleAnalyze(message.payload)
      .then((result) => sendResponse({ success: true, result }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async
  }

  if (message.type === "SYNC_DATA") {
    syncUserData()
      .then(() => sendResponse({ success: true }))
      .catch(() => sendResponse({ success: false }));
    return true;
  }

  if (message.type === "SET_SESSION") {
    chrome.storage.local.set({
      session: message.session,
      user: message.user,
    });
    syncUserData();
    sendResponse({ success: true });
    return false;
  }

  if (message.type === "LOGOUT") {
    chrome.storage.local.clear();
    sendResponse({ success: true });
    return false;
  }

  if (message.type === "GET_CONTEXT_AGENT") {
    const url = sender.tab?.url || "";
    const suggestedAgent = detectContextAgent(url);
    sendResponse({ agentId: suggestedAgent });
    return false;
  }
});

// ============ ANALYSIS API ============

async function handleAnalyze(payload) {
  const { text, agentId, title } = payload;

  // Check auth
  const data = await chrome.storage.local.get(["session"]);
  if (!data.session) {
    throw new Error("Please sign in to analyze text.");
  }

  return runAnalysis(text, agentId, title);
}

async function runAnalysis(text, agentId, title) {
  const data = await chrome.storage.local.get(["session"]);
  const token = data.session?.access_token;

  if (!token) {
    throw new Error("Session expired. Please sign in again.");
  }

  const response = await fetch(`${API_BASE}/api/analyses/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: title || text.slice(0, 50),
      inputText: text,
      agentId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Analysis failed (${response.status})`);
  }

  // Parse SSE stream
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";
  let analysisId = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const event = JSON.parse(line.slice(6));
          if (event.type === "started") {
            analysisId = event.id;
          } else if (event.type === "chunk") {
            fullContent += event.content;
          } else if (event.type === "complete") {
            // Update streak
            await updateStreak();
            // Store in recent
            await storeRecentAnalysis(event, agentId, analysisId);
            return { ...event.result, id: analysisId };
          } else if (event.type === "error") {
            throw new Error(event.message || "Analysis failed");
          }
        } catch (e) {
          if (e.message && !e.message.includes("JSON")) throw e;
        }
      }
    }
  }

  // Try parsing accumulated content as fallback
  if (fullContent) {
    try {
      const result = JSON.parse(fullContent);
      await updateStreak();
      return { ...result, id: analysisId };
    } catch {
      throw new Error("Failed to parse analysis result");
    }
  }

  throw new Error("No result received from analysis");
}

// ============ STREAK TRACKING ============

async function updateStreak() {
  const data = await chrome.storage.local.get(["streak"]);
  const streak = data.streak || { count: 0, lastDate: "" };
  const today = new Date().toISOString().split("T")[0];

  if (streak.lastDate === today) {
    return; // Already counted today
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (streak.lastDate === yesterday) {
    // Continue streak
    streak.count += 1;
  } else if (streak.lastDate === "") {
    // First ever
    streak.count = 1;
  } else {
    // Streak broken
    streak.count = 1;
  }

  streak.lastDate = today;
  await chrome.storage.local.set({ streak });
}

// ============ RECENT ANALYSES ============

async function storeRecentAnalysis(event, agentId, analysisId) {
  const data = await chrome.storage.local.get(["recentAnalyses"]);
  const recent = data.recentAnalyses || [];

  const agentNames = {
    "cold-email-grader": "Cold Email",
    "social-post-optimizer": "Social Post",
    "newsletter-grader": "Newsletter",
    "support-response-grader": "Support Reply",
    "ad-copy-grader": "Ad Copy",
    "landing-page-reviewer": "Landing Page",
    "listing-optimizer": "Listing",
    "resume-reviewer": "Resume",
    "contract-reviewer": "Contract",
    "pitch-deck-reviewer": "Pitch Deck",
    "technical-docs-reviewer": "Tech Docs",
    "proposal-analyzer": "Proposal",
    "privacy-policy-reviewer": "Privacy Policy",
    "job-post-analyzer": "Job Post",
  };

  const entry = {
    id: analysisId,
    score: event.result?.score || 0,
    title: event.result?.summary?.slice(0, 60) || "Analysis",
    agentName: agentNames[agentId] || agentId,
    date: new Date().toISOString(),
  };

  recent.unshift(entry);
  await chrome.storage.local.set({ recentAnalyses: recent.slice(0, 20) });
}

// ============ DATA SYNC ============

async function syncUserData() {
  const data = await chrome.storage.local.get(["session"]);
  const token = data.session?.access_token;
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/api/usage`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const usage = await response.json();
      await chrome.storage.local.set({
        plan: usage.plan || "free",
        usage: {
          used: usage.analysisCount || 0,
          limit: usage.maxAnalyses || 10,
          avgScore: usage.avgScore || 0,
        },
      });
    }
  } catch {
    // Offline — use cached
  }
}

// ============ CONTEXT DETECTION ============

function detectContextAgent(url) {
  if (url.includes("mail.google.com")) return "cold-email-grader";
  if (url.includes("linkedin.com")) return "social-post-optimizer";
  if (url.includes("docs.google.com")) return "newsletter-grader";
  return "cold-email-grader";
}

// ============ ALARMS ============

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "streak-check") {
    syncUserData();
  }
});
