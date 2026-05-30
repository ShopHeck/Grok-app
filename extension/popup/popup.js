/**
 * AgentDesk Extension Popup
 * Handles login state, quick analysis, and recent results display
 */

const API_BASE = "https://agentdesk.app"; // Updated in production

// DOM Elements
const states = {
  loading: document.getElementById("loading-state"),
  loggedOut: document.getElementById("logged-out-state"),
  loggedIn: document.getElementById("logged-in-state"),
};

const els = {
  signInBtn: document.getElementById("sign-in-btn"),
  signUpLink: document.getElementById("sign-up-link"),
  planBadge: document.getElementById("plan-badge"),
  analysesUsed: document.getElementById("analyses-used"),
  analysesLimit: document.getElementById("analyses-limit"),
  avgScore: document.getElementById("avg-score"),
  streakCount: document.getElementById("streak-count"),
  agentSelect: document.getElementById("agent-select"),
  inputText: document.getElementById("input-text"),
  charCount: document.getElementById("char-count"),
  analyzeBtn: document.getElementById("analyze-btn"),
  resultArea: document.getElementById("result-area"),
  scorePath: document.getElementById("score-path"),
  scoreText: document.getElementById("score-text"),
  resultSummary: document.getElementById("result-summary"),
  resultAgent: document.getElementById("result-agent"),
  suggestionsList: document.getElementById("suggestions-list"),
  viewFullBtn: document.getElementById("view-full-btn"),
  copyRewriteBtn: document.getElementById("copy-rewrite-btn"),
  recentList: document.getElementById("recent-list"),
  upgradeBanner: document.getElementById("upgrade-banner"),
  upgradeBtn: document.getElementById("upgrade-btn"),
  settingsBtn: document.getElementById("settings-btn"),
};

let currentUser = null;
let currentResult = null;

// Initialize
async function init() {
  showState("loading");

  const session = await getSession();
  if (session) {
    currentUser = session;
    showState("loggedIn");
    await loadDashboard();
  } else {
    showState("loggedOut");
  }
}

function showState(state) {
  Object.values(states).forEach((el) => el.classList.add("hidden"));
  states[state]?.classList.remove("hidden");
}

// Auth
async function getSession() {
  try {
    const data = await chrome.storage.local.get(["session", "user"]);
    if (data.session && data.user) {
      return data.user;
    }
    return null;
  } catch {
    return null;
  }
}

// Dashboard data
async function loadDashboard() {
  try {
    const data = await chrome.storage.local.get([
      "usage",
      "streak",
      "recentAnalyses",
      "plan",
    ]);

    // Plan
    const plan = data.plan || "free";
    els.planBadge.textContent = plan.charAt(0).toUpperCase() + plan.slice(1);
    if (plan !== "free") els.planBadge.classList.add("pro");

    // Usage
    const usage = data.usage || { used: 0, limit: 10, avgScore: 0 };
    els.analysesUsed.textContent = usage.used;
    els.analysesLimit.textContent = usage.limit === -1 ? "∞" : usage.limit;
    els.avgScore.textContent = usage.avgScore > 0 ? usage.avgScore : "--";

    // Streak
    const streak = data.streak || { count: 0 };
    els.streakCount.textContent = streak.count;

    // Recent analyses
    const recent = data.recentAnalyses || [];
    renderRecent(recent);

    // Extension weekly quota (free users)
    if (plan === "free") {
      const weeklyUsage = await getExtensionWeeklyUsage();
      if (weeklyUsage >= 3) {
        els.upgradeBanner.classList.remove("hidden");
      }
    }

    // Sync fresh data from API
    syncFromApi();
  } catch (error) {
    console.error("Failed to load dashboard:", error);
  }
}

async function getExtensionWeeklyUsage() {
  const data = await chrome.storage.local.get(["extensionWeeklyUsage"]);
  const usage = data.extensionWeeklyUsage || { count: 0, weekStart: "" };
  const currentWeekStart = getWeekStart();
  if (usage.weekStart !== currentWeekStart) {
    return 0; // New week, reset
  }
  return usage.count;
}

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).toISOString().split("T")[0];
}

async function syncFromApi() {
  try {
    const response = await chrome.runtime.sendMessage({ type: "SYNC_DATA" });
    if (response?.success) {
      await loadDashboard();
    }
  } catch {
    // Offline or API error — use cached data
  }
}

// Render recent analyses
function renderRecent(analyses) {
  if (!analyses.length) {
    els.recentList.innerHTML = '<p class="text-muted text-sm">No analyses yet. Try one above!</p>';
    return;
  }

  els.recentList.innerHTML = analyses
    .slice(0, 5)
    .map((a) => {
      const scoreClass = a.score >= 80 ? "high" : a.score >= 50 ? "med" : "low";
      return `
      <div class="recent-item" data-id="${a.id}">
        <div class="score-mini ${scoreClass}">${a.score}</div>
        <div class="recent-meta">
          <div class="recent-title">${escapeHtml(a.title)}</div>
          <div class="recent-agent">${a.agentName}</div>
        </div>
      </div>
    `;
    })
    .join("");
}

// Input handling
els.inputText.addEventListener("input", () => {
  const len = els.inputText.value.length;
  const max = currentUser?.plan === "pro" ? 50000 : 5000;
  els.charCount.textContent = `${len.toLocaleString()} / ${max.toLocaleString()}`;
  els.analyzeBtn.disabled = len === 0 || len > max;
});

// Analyze
els.analyzeBtn.addEventListener("click", async () => {
  const text = els.inputText.value.trim();
  const agentId = els.agentSelect.value;

  if (!text) return;

  // Check weekly quota for free users
  const plan = (await chrome.storage.local.get(["plan"])).plan || "free";
  if (plan === "free") {
    const weeklyUsage = await getExtensionWeeklyUsage();
    if (weeklyUsage >= 3) {
      els.upgradeBanner.classList.remove("hidden");
      return;
    }
  }

  els.analyzeBtn.disabled = true;
  els.analyzeBtn.textContent = "Analyzing...";
  els.resultArea.classList.remove("hidden");
  els.scoreText.textContent = "...";
  els.resultSummary.textContent = "Analyzing your text...";

  try {
    const response = await chrome.runtime.sendMessage({
      type: "ANALYZE",
      payload: { text, agentId, title: text.slice(0, 50) },
    });

    if (response?.success && response.result) {
      currentResult = response.result;
      displayResult(response.result, agentId);

      // Increment weekly usage
      await incrementExtensionUsage();
    } else {
      els.resultSummary.textContent = response?.error || "Analysis failed. Try again.";
    }
  } catch (error) {
    els.resultSummary.textContent = "Connection error. Check your internet.";
  } finally {
    els.analyzeBtn.disabled = false;
    els.analyzeBtn.textContent = "Analyze";
  }
});

async function incrementExtensionUsage() {
  const currentWeekStart = getWeekStart();
  const data = await chrome.storage.local.get(["extensionWeeklyUsage"]);
  const usage = data.extensionWeeklyUsage || { count: 0, weekStart: currentWeekStart };

  if (usage.weekStart !== currentWeekStart) {
    await chrome.storage.local.set({
      extensionWeeklyUsage: { count: 1, weekStart: currentWeekStart },
    });
  } else {
    await chrome.storage.local.set({
      extensionWeeklyUsage: { count: usage.count + 1, weekStart: currentWeekStart },
    });
  }
}

function displayResult(result, agentId) {
  const score = result.score || 0;

  // Animate score ring
  const circumference = 100;
  const offset = (score / 100) * circumference;
  els.scorePath.style.strokeDasharray = `${offset}, ${circumference}`;
  els.scoreText.textContent = score;

  // Color based on score
  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  els.scorePath.style.stroke = color;

  els.resultSummary.textContent = result.summary || "Analysis complete";
  els.resultAgent.textContent = getAgentName(agentId);

  // Suggestions
  const suggestions = result.suggestions || [];
  els.suggestionsList.innerHTML = suggestions
    .slice(0, 3)
    .map((s) => `<div class="suggestion-item">${escapeHtml(s)}</div>`)
    .join("");

  // Enable copy rewrite if available
  els.copyRewriteBtn.disabled = !result.rewrite;
}

// Copy rewrite
els.copyRewriteBtn.addEventListener("click", async () => {
  if (!currentResult?.rewrite) return;
  await navigator.clipboard.writeText(currentResult.rewrite);
  els.copyRewriteBtn.textContent = "Copied!";
  setTimeout(() => {
    els.copyRewriteBtn.textContent = "Copy Rewrite";
  }, 2000);
});

// View full report
els.viewFullBtn.addEventListener("click", () => {
  if (currentResult?.id) {
    chrome.tabs.create({ url: `${API_BASE}/analyses/${currentResult.id}` });
  } else {
    chrome.tabs.create({ url: `${API_BASE}/analyses/new` });
  }
});

// Sign in
els.signInBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: `${API_BASE}/sign-in?source=extension` });
});

els.signUpLink.addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: `${API_BASE}/sign-up?source=extension` });
});

// Settings
els.settingsBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: `${API_BASE}/settings` });
});

// Upgrade
els.upgradeBtn?.addEventListener("click", () => {
  chrome.tabs.create({ url: `${API_BASE}/settings?upgrade=true` });
});

// Utility
function getAgentName(id) {
  const names = {
    "cold-email-grader": "📬 Cold Email Grader",
    "social-post-optimizer": "📱 Social Post Optimizer",
    "newsletter-grader": "📧 Newsletter Grader",
    "support-response-grader": "💬 Support Response Grader",
    "ad-copy-grader": "🎯 Ad Copy Grader",
    "landing-page-reviewer": "🖥️ Landing Page Reviewer",
    "listing-optimizer": "🏷️ Listing Optimizer",
    "resume-reviewer": "📋 Resume Reviewer",
  };
  return names[id] || id;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Init
init();
