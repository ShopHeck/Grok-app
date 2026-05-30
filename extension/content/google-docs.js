/**
 * AgentDesk Content Script - Google Docs
 * Listens for right-click analysis from context menu,
 * displays results in floating badge
 */

(function () {
  "use strict";

  let currentBadge = null;
  let currentPanel = null;

  // Listen for messages from background
  chrome.runtime.onMessage.addListener((message) => {
    switch (message.type) {
      case "SHOW_ANALYZING":
        showAnalyzing();
        break;
      case "SHOW_RESULT":
        showResult(message.result);
        break;
      case "SHOW_ERROR":
        showError(message.error);
        break;
    }
  });

  // ============ UI ============

  function showAnalyzing() {
    removeBadge();
    const el = document.createElement("div");
    el.className = "agentdesk-analyzing";
    el.id = "agentdesk-badge";
    el.innerHTML = `
      <div class="spinner"></div>
      <span>Analyzing document text...</span>
    `;
    document.body.appendChild(el);
    currentBadge = el;
  }

  function showResult(result) {
    removeBadge();
    removePanel();

    const score = result.score || 0;
    const scoreClass = score >= 80 ? "high" : score >= 50 ? "med" : "low";

    const badge = document.createElement("div");
    badge.className = "agentdesk-score-badge";
    badge.id = "agentdesk-badge";
    badge.innerHTML = `
      <div class="score-circle ${scoreClass}">${score}</div>
      <div class="badge-content">
        <div class="badge-title">${result.summary || "Analysis complete"}</div>
        <div class="badge-subtitle">Click for suggestions</div>
      </div>
      <button class="close-btn" title="Close">×</button>
    `;

    badge.querySelector(".close-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      removeBadge();
      removePanel();
    });

    badge.addEventListener("click", () => togglePanel(result));
    document.body.appendChild(badge);
    currentBadge = badge;
  }

  function togglePanel(result) {
    if (currentPanel) { removePanel(); return; }

    const panel = document.createElement("div");
    panel.className = "agentdesk-suggestions-panel";
    panel.id = "agentdesk-panel";

    const suggestions = (result.suggestions || []).slice(0, 5);
    panel.innerHTML = `
      <h4>Suggestions</h4>
      ${suggestions.map((s) => `<div class="suggestion">${escapeHtml(s)}</div>`).join("")}
      ${result.rewrite ? `<button class="apply-rewrite-btn">📋 Copy Rewrite</button>` : ""}
    `;

    if (result.rewrite) {
      panel.querySelector(".apply-rewrite-btn").addEventListener("click", () => {
        navigator.clipboard.writeText(result.rewrite);
        panel.querySelector(".apply-rewrite-btn").textContent = "✓ Copied!";
        setTimeout(() => {
          panel.querySelector(".apply-rewrite-btn").textContent = "📋 Copy Rewrite";
        }, 2000);
      });
    }

    document.body.appendChild(panel);
    currentPanel = panel;
  }

  function showError(error) {
    removeBadge();
    const el = document.createElement("div");
    el.className = "agentdesk-score-badge";
    el.id = "agentdesk-badge";
    el.innerHTML = `
      <div class="score-circle low">!</div>
      <div class="badge-content">
        <div class="badge-title">${escapeHtml(error)}</div>
        <div class="badge-subtitle">Click to dismiss</div>
      </div>
    `;
    el.addEventListener("click", removeBadge);
    document.body.appendChild(el);
    setTimeout(removeBadge, 5000);
  }

  function removeBadge() {
    document.getElementById("agentdesk-badge")?.remove();
    currentBadge = null;
  }

  function removePanel() {
    document.getElementById("agentdesk-panel")?.remove();
    currentPanel = null;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }
})();
