# Chrome Web Store Listing — AgentDesk - AI Writing Analyzer

> Last Updated: 2026-05-30

## Store Listing

**Extension Name**
AgentDesk - AI Writing Analyzer

**Short Description**
Score your writing instantly with AI. Right-click any text to analyze cold emails, LinkedIn posts, ad copy, and more.

**Detailed Description**
AgentDesk is your personal AI-powered writing coach that runs directly in your browser. Get instant clarity, engagement, and effectiveness scores on any text you write before you hit send.

Whether you are crafting cold emails on Gmail, writing posts on LinkedIn, or drafting documents in Google Docs, AgentDesk analyzes your writing and provides actionable suggestions to improve your copy's impact.

Key Features:
- Instant scoring (0-100) based on engagement, clarity, and style guidelines
- Smart suggestions detailing how to rewrite sections for better results
- One-click copy for AI-optimized rewrites
- Direct integration button inside Gmail and LinkedIn composers
- Global context-menu support (right-click any highlighted text to analyze)
- Daily streak tracking to build consistent, high-impact writing habits

How to use it:
1. Pin the extension to your toolbar and sign in.
2. Select any text on a web page, right-click, and choose "Analyze with AgentDesk".
3. Or, click the Gmail "Score Email" or LinkedIn "Score Post" buttons directly in your composer.
4. Review your grade, copy the optimized rewrite, and improve your metrics!

Privacy and Permissions:
AgentDesk takes privacy seriously. We only transmit the specific text you select for analysis to our secure grading API. We never track your browsing history or sell your data.

Support and Feedback:
Have questions or suggestions? Reach out to support@agentdesk.app or visit grok-app-eta.vercel.app/support.

**Category**
Productivity

**Single Purpose**
Score and optimize written content in Gmail, LinkedIn, and websites using specialized AI analysis.

**Primary Language**
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `extension/assets/icon-128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | |
| Marquee Promo Tile | 1400×560 | ⬜ Not created | |

### Screenshot Notes
- **Screenshot 1**: Extension popup interface showing an email grade score, summary, engagement suggestions, and the "Copy Rewrite" button.
- **Screenshot 2**: Gmail compose window with the inline "Score Email" button and the floating score badge overlay demonstrating the integration.
- **Screenshot 3**: Right-click context menu active over a LinkedIn post selection, highlighting the "Analyze with AgentDesk -> Score as Social Post" options.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `activeTab` | permissions | Used to temporarily access the active page content when the user explicitly triggers an analysis from the context menu. |
| `contextMenus` | permissions | Used to add analysis options to the right-click menu, allowing quick selection-based grading. |
| `storage` | permissions | Used to persist the Supabase authentication session, usage quotas, streak metrics, and recent analysis history locally. |
| `alarms` | permissions | Used to run a background alarm once per hour to sync and update usage statistics with the AgentDesk server. |
| `https://mail.google.com/*` | host_permissions | Required to inject the content script that adds the helper button to the Gmail compose toolbar. |
| `https://www.linkedin.com/*` | host_permissions | Required to inject the content script that adds the helper button to the LinkedIn sharing box. |
| `https://docs.google.com/*` | host_permissions | Required to run content scripts that handle context-menu selections and draw result overlays on Google Docs. |
| `https://grok-app-eta.vercel.app/*` | host_permissions | Required to authenticate the extension by reading the Supabase session token from the main web application page. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Yes

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Authentication info | Yes | Yes | To verify the user's account status and premium features. | No |
| Personal communications | Yes | Yes | We transmit the user's highlighted/composed text to our analysis servers to return grades, feedback, and AI rewrites. | No |
| User activity | Yes | Yes | To track daily analysis streaks and usage quotas. | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL**
https://grok-app-eta.vercel.app/privacy

## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free

## Developer Info

**Publisher Name**
AgentDesk LLC

**Contact Email**
developer@agentdesk.app

**Support URL / Email**
support@agentdesk.app

**Homepage URL**
https://grok-app-eta.vercel.app

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-05-30 | Initial production release. | Draft |

## Review Notes

### Known Issues / Limitations
- None.
