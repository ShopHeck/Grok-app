import { AgentConfig } from "./types";

export const privacyPolicyReviewer: AgentConfig = {
  id: "privacy-policy-reviewer",
  name: "Privacy Policy Simplifier",
  description:
    "Get a plain-English summary and risk assessment of any privacy policy, terms of service, or GDPR/CCPA notice — whether you're writing one or reviewing one.",
  icon: "🛡️",
  category: "legal",
  tier: "pro",
  placeholder:
    "Paste the privacy policy, terms of service, or data processing agreement here...\n\nWorks with:\n- Website privacy policies\n- App terms of service\n- GDPR/CCPA notices\n- Data processing agreements\n- Cookie policies",
  inputLabel: "Privacy Policy / Terms of Service",
  maxInputLength: 50000,
  exampleInput: `PRIVACY POLICY

Last updated: January 15, 2024

1. INFORMATION WE COLLECT
We collect information you provide directly, including name, email, payment information, and any content you upload. We also automatically collect device information, IP addresses, browsing history, location data, and interactions with our service.

2. HOW WE USE YOUR INFORMATION
We use collected information to provide services, improve our products, send marketing communications, share with advertising partners, train machine learning models, and for any other purpose we deem necessary.

3. SHARING YOUR DATA
We share your personal information with:
- Advertising partners
- Analytics providers
- Any company within our corporate family
- Law enforcement when requested
- Third parties in connection with a merger or acquisition
- Any other third parties with your "consent" (which you grant by using our service)

4. DATA RETENTION
We retain your data indefinitely, even after account deletion, unless required by law to delete it.

5. YOUR RIGHTS
You may request access to your data by writing to our legal department. We will respond within 90 business days. Deletion requests are subject to our operational needs.

6. COOKIES
We use cookies and similar tracking technologies. By using our site, you consent to all cookies. There is no option to opt out of essential cookies (which includes analytics and advertising).

7. CHANGES TO THIS POLICY
We may update this policy at any time without notice. Continued use constitutes acceptance.`,
  systemPrompt: `You are a privacy and data rights expert with deep knowledge of GDPR, CCPA/CPRA, COPPA, and international data protection frameworks. You make complex legal language accessible to everyday users while identifying genuinely concerning data practices.

IMPORTANT DISCLAIMER: You provide educational analysis only, not legal advice. Always recommend consulting a privacy attorney for compliance needs.

Analyze the provided privacy policy/ToS and return a JSON response with this EXACT structure:
{
  "score": <0-100 privacy safety score — 100 = very privacy-respecting, 0 = extremely invasive>,
  "summary": "<one sentence plain-English verdict>",
  "details": {
    "data_collection": {
      "score": <0-100>,
      "what_they_collect": ["<list each data type in plain English>"],
      "necessity": "<minimal/reasonable/excessive/invasive>",
      "transparency": "<clear/vague/hidden>",
      "suggestions": ["<what to watch out for or request removal of>"]
    },
    "data_usage": {
      "score": <0-100>,
      "purposes": ["<each stated use in plain English>"],
      "concerning_uses": ["<advertising, ML training, profiling, etc>"],
      "purpose_limitation": "<specific/broad/unlimited>",
      "suggestions": ["<improvements or objections>"]
    },
    "data_sharing": {
      "score": <0-100>,
      "third_parties": ["<who gets your data>"],
      "advertising": <true/false>,
      "cross_border_transfers": "<mentioned/unmentioned>",
      "suggestions": ["<opt-out rights to exercise>"]
    },
    "user_rights": {
      "score": <0-100>,
      "access_right": "<easy/difficult/absent>",
      "deletion_right": "<genuine/limited/illusory>",
      "portability": "<available/absent>",
      "opt_out_options": ["<what you can opt out of>"],
      "suggestions": ["<rights to exercise>"]
    },
    "data_retention": {
      "score": <0-100>,
      "retention_period": "<specific timeframe/vague/indefinite>",
      "post_deletion": "<data deleted/retained/unclear>",
      "suggestions": ["<what to request>"]
    },
    "consent_practices": {
      "score": <0-100>,
      "consent_type": "<explicit/implied/forced/bundled>",
      "withdraw_ability": "<easy/difficult/impossible>",
      "dark_patterns": ["<any manipulative consent UX described>"],
      "suggestions": ["<how to protect yourself>"]
    },
    "regulatory_compliance": {
      "score": <0-100>,
      "gdpr_compliant": "<yes/partial/no/unclear>",
      "ccpa_compliant": "<yes/partial/no/unclear>",
      "missing_requirements": ["<required disclosures that are absent>"],
      "suggestions": ["<compliance gaps to flag>"]
    }
  },
  "suggestions": ["<top 5 actions to protect your privacy or improve this policy>"],
  "flags": [
    {"severity": "info|warning|critical", "message": "<plain English issue>", "context": "<relevant excerpt>"}
  ],
  "plain_english_summary": "<3-4 paragraph summary explaining what this policy REALLY means for you in everyday language>",
  "tldr_bullet_points": ["<5-7 bullet point TL;DR of what you're agreeing to>"]
}

IMPORTANT RULES:
- Write for someone with ZERO legal or tech knowledge
- "We may share with third parties" is NEVER acceptable without specifics — flag it
- Indefinite data retention is a critical red flag
- "By using our service you consent" = forced consent = critical flag
- "We may update without notice" removes all user control — always flag
- Training ML/AI on user data without explicit consent is increasingly illegal — flag
- Compare against GDPR standards even for US companies (highest standard)
- No opt-out for advertising cookies = violation of multiple regulations
- "Operational needs" overriding deletion requests = illusory right
- Score from the USER's perspective (low = your privacy is at risk)
- Highlight what's MISSING that should be there (DPO contact, lawful basis, etc)
- Be protective of the reader — assume they're evaluating whether to trust this company`,

  outputSchema: [
    { key: "score", label: "Privacy Score", type: "score", description: "0-100 how well your privacy is protected" },
    { key: "details.data_collection", label: "Data Collection", type: "score", description: "What they gather" },
    { key: "details.data_sharing", label: "Data Sharing", type: "score", description: "Who gets your info" },
    { key: "details.user_rights", label: "Your Rights", type: "score", description: "Control over your data" },
    { key: "details.data_retention", label: "Retention", type: "score", description: "How long they keep it" },
    { key: "details.regulatory_compliance", label: "Compliance", type: "score", description: "Legal requirements met" },
    { key: "suggestions", label: "Actions to Take", type: "list", description: "How to protect yourself" },
    { key: "flags", label: "Red Flags", type: "flags", description: "Privacy concerns" },
    { key: "rewrite", label: "Plain English Summary", type: "rewrite", description: "What this really means" },
  ],

  scoringRubric: [
    { name: "Data Minimization", weight: 0.2, description: "Collect only what's necessary, clearly stated" },
    { name: "Transparency", weight: 0.2, description: "Clear language, specific purposes, named parties" },
    { name: "User Control", weight: 0.25, description: "Easy opt-out, real deletion, data portability" },
    { name: "Sharing Practices", weight: 0.2, description: "Limited sharing, no ad networks, no selling" },
    { name: "Regulatory Compliance", weight: 0.15, description: "GDPR/CCPA compliant, required disclosures present" },
  ],
};
