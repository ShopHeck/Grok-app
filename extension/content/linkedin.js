/**
 * AgentDesk Content Script - LinkedIn
 * Auto-detects post composer, suggests Social Post Optimizer,
 * shows floating score badge after analysis
 */

(function () {
  "use strict";

  const AGENT_ID = "social-post-optimizer";
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

  // ============ POST COMPOSER DETECTION ============

  function detectPostComposer() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;

          // LinkedIn post editor detection
          const editor =
            node.querySelector?.(".ql-editor") ||
            node.querySelector?.("[data-placeholder='What do you want to talk about?']") ||
            node.querySelector?.("[role='textbox'][contenteditable='true']");

          if (editor && !editor.dataset.agentdeskAttached) {
            attachComposerHelper(editor);
            editor.dataset.agentdeskAttached = "true";
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function attachComposerHelper(editorEl) {
    // Watch for text changes and add score button to modal footer
    const modal = editorEl.closest("[role='dialog']") || editorEl.closest(".share-box");
    if (!modal) return;

    const footer = modal.querySelector(".share-box_actions") ||
      modal.querySelector("[class*='footer']") ||
      modal.querySelector("[class*='actions']");

    if (!footer || footer.querySelector(".agentdesk-score-btn")) return;

    const btn = document.createElement("button");
    btn.className = "agentdesk-score-btn";
    btn.style.cssText = `
      padding: 6px 12px;
      border: 1px solid #6366f1;
      border-radius: 16px;
      background: white;
      font-size: 12px;
      color: #6366f1;
      cursor: pointer;
      font-weight: 600;
      margin-right: 8px;
    `;
    btn.textContent = "⚡ Score Post";

    btn.addEventListener("click", async () => {
      const text = editorEl.innerText?.trim();
      if (text) {
        showAnalyzing();
        try {
          const response = await chrome.runtime.sendMessage({
            type: "ANALYZE",
            payload: { text, agentId: AGENT_ID, title: "LinkedIn Post" },
          });
          if (response?.success && response.result) {
            showResult(response.result);
          }
        } catch (err) {
          showError(err.message || "Failed to analyze text");
        }
      }
    });

    footer.prepend(btn);
  }

  // ============ UI (shared pattern) ============

  function showAnalyzing() {
    removeBadge();
    const el = document.createElement("div");
    el.className = "agentdesk-analyzing";
    el.id = "agentdesk-badge";
    el.innerHTML = `
      <div class="spinner"></div>
      <span>Scoring your post...</span>
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
        <div class="badge-title">${result.summary || "Post scored"}</div>
        <div class="badge-subtitle">Click for tips</div>
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
      <h4>Engagement Tips</h4>
      ${suggestions.map((s) => `<div class="suggestion">${escapeHtml(s)}</div>`).join("")}
      ${result.rewrite ? `<button class="apply-rewrite-btn">📋 Copy Optimized Post</button>` : ""}
    `;

    if (result.rewrite) {
      panel.querySelector(".apply-rewrite-btn").addEventListener("click", () => {
        navigator.clipboard.writeText(result.rewrite);
        panel.querySelector(".apply-rewrite-btn").textContent = "✓ Copied!";
        setTimeout(() => {
          panel.querySelector(".apply-rewrite-btn").textContent = "📋 Copy Optimized Post";
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

  // Init
  detectPostComposer();
})();
