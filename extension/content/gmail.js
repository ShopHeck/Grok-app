/**
 * AgentDesk Content Script - Gmail
 * Auto-detects compose window, suggests Cold Email Grader,
 * shows floating score badge after analysis
 */

(function () {
  "use strict";

  const AGENT_ID = "cold-email-grader";
  let currentBadge = null;
  let currentPanel = null;

  // Listen for messages from background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case "SHOW_ANALYZING":
        showAnalyzing();
        break;
      case "SHOW_RESULT":
        showResult(message.result, message.agentId);
        break;
      case "SHOW_ERROR":
        showError(message.error);
        break;
    }
  });

  // ============ COMPOSE DETECTION ============

  function detectComposeWindow() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;

          // Gmail compose window detection
          const compose = node.querySelector?.(".Am.Al.editable") || 
            (node.classList?.contains("Am") && node.classList?.contains("editable") ? node : null);

          if (compose) {
            attachComposeHelper(compose);
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function attachComposeHelper(composeEl) {
    // Add a subtle "Score with AgentDesk" button near compose toolbar
    const toolbar = composeEl.closest(".iN")?.querySelector(".btC");
    if (!toolbar || toolbar.querySelector(".agentdesk-compose-btn")) return;

    const btn = document.createElement("div");
    btn.className = "agentdesk-compose-btn";
    btn.innerHTML = `
      <button style="
        padding: 4px 10px;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        background: white;
        font-size: 11px;
        color: #6366f1;
        cursor: pointer;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-left: 8px;
      ">
        ⚡ Score Email
      </button>
    `;

    btn.addEventListener("click", async () => {
      const text = composeEl.innerText?.trim();
      if (text) {
        showAnalyzing();
        try {
          const response = await chrome.runtime.sendMessage({
            type: "ANALYZE",
            payload: { text, agentId: AGENT_ID, title: "Gmail Draft" },
          });
          if (response?.success && response.result) {
            showResult(response.result, AGENT_ID);
          }
        } catch (err) {
          showError(err.message || "Failed to analyze text");
        }
      }
    });

    toolbar.appendChild(btn);
  }

  // ============ UI ELEMENTS ============

  function showAnalyzing() {
    removeBadge();
    const el = document.createElement("div");
    el.className = "agentdesk-analyzing";
    el.id = "agentdesk-badge";
    el.innerHTML = `
      <div class="spinner"></div>
      <span>Analyzing with AgentDesk...</span>
    `;
    document.body.appendChild(el);
    currentBadge = el;
  }

  function showResult(result, agentId) {
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

    badge.addEventListener("click", () => {
      togglePanel(result);
    });

    document.body.appendChild(badge);
    currentBadge = badge;
  }

  function togglePanel(result) {
    if (currentPanel) {
      removePanel();
      return;
    }

    const panel = document.createElement("div");
    panel.className = "agentdesk-suggestions-panel";
    panel.id = "agentdesk-panel";

    const suggestions = (result.suggestions || []).slice(0, 5);
    const suggestionsHtml = suggestions
      .map((s) => `<div class="suggestion">${escapeHtml(s)}</div>`)
      .join("");

    panel.innerHTML = `
      <h4>Top Suggestions</h4>
      ${suggestionsHtml}
      ${result.rewrite ? `<button class="apply-rewrite-btn">📋 Copy AI Rewrite</button>` : ""}
    `;

    if (result.rewrite) {
      panel.querySelector(".apply-rewrite-btn").addEventListener("click", () => {
        navigator.clipboard.writeText(result.rewrite);
        panel.querySelector(".apply-rewrite-btn").textContent = "✓ Copied!";
        setTimeout(() => {
          panel.querySelector(".apply-rewrite-btn").textContent = "📋 Copy AI Rewrite";
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
    currentBadge = el;

    setTimeout(removeBadge, 5000);
  }

  function removeBadge() {
    const el = document.getElementById("agentdesk-badge");
    if (el) el.remove();
    currentBadge = null;
  }

  function removePanel() {
    const el = document.getElementById("agentdesk-panel");
    if (el) el.remove();
    currentPanel = null;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  // ============ INIT ============
  detectComposeWindow();
})();
