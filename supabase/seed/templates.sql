-- Seed: 20 Official Templates across agents
-- These are inserted with a placeholder author_id that should be replaced
-- with the actual admin/system user ID after first deployment.
-- Run: UPDATE templates SET author_id = 'YOUR_ADMIN_USER_ID' WHERE is_official = true;

-- Use a placeholder UUID for the official "AgentDesk" system author
-- Replace after deploying with actual admin user UUID
DO $$
DECLARE
  v_author_id uuid := 'c2525bdf-f204-4fc5-88eb-9f287d3279ed';
BEGIN

-- ═══════════════════════════════════════════════════════
-- COLD EMAIL GRADER (3 templates)
-- ═══════════════════════════════════════════════════════

INSERT INTO templates (title, description, agent_id, content, score, category, tags, author_id, is_official, is_public, uses_count, rating, rating_count)
VALUES (
  'SaaS Demo Request (Personalized)',
  'High-converting cold email for booking SaaS demos. Research-backed personalization with a low-friction CTA.',
  'cold-email-grader',
  E'Hi {{firstName}},\n\nI saw {{company}} just {{recent_trigger}} — congrats on the momentum.\n\nWe help teams like yours {{specific_benefit}} without {{common_objection}}. {{social_proof_company}} cut their {{metric}} by {{percentage}} in the first month.\n\nWould you be open to a 12-min call this week to see if it''s relevant?\n\nBest,\n{{your_name}}',
  91,
  'cold-outreach',
  ARRAY['saas', 'demo', 'b2b', 'personalized'],
  v_author_id, true, true, 1247, 4.7, 89
),
(
  'Mutual Connection Warm Intro',
  'Leverage a shared connection for a warm cold email. High reply rates due to social proof built into the opener.',
  'cold-email-grader',
  E'Hi {{firstName}},\n\n{{mutual_connection}} mentioned you''re the person to talk to about {{topic}} at {{company}}.\n\nI help {{role_type}} teams {{outcome}} — we recently worked with {{similar_company}} on exactly this.\n\nWould a quick intro call make sense? Happy to share what worked for them.\n\nCheers,\n{{your_name}}\n\nP.S. {{mutual_connection}} says hi!',
  88,
  'cold-outreach',
  ARRAY['warm-intro', 'referral', 'mutual-connection'],
  v_author_id, true, true, 892, 4.5, 67
),
(
  'Breakup Email (Final Follow-up)',
  'The "permission to close your file" email that gets replies from ghosted prospects. Use after 3-4 touches with no response.',
  'cold-email-grader',
  E'Hi {{firstName}},\n\nI''ve reached out a few times and haven''t heard back — totally understand you''re busy.\n\nI''ll assume the timing isn''t right and close the loop on my end. If {{pain_point}} becomes a priority later, I''m here.\n\nNo hard feelings either way. Should I check back in Q{{next_quarter}}?\n\n{{your_name}}',
  85,
  'cold-outreach',
  ARRAY['follow-up', 'breakup', 'last-touch'],
  v_author_id, true, true, 2103, 4.8, 156
);

-- ═══════════════════════════════════════════════════════
-- SOCIAL POST OPTIMIZER (3 templates)
-- ═══════════════════════════════════════════════════════

INSERT INTO templates (title, description, agent_id, content, score, category, tags, author_id, is_official, is_public, uses_count, rating, rating_count)
VALUES (
  'LinkedIn Thought Leadership (Hook + Story)',
  'The classic hook → story → lesson format that drives engagement on LinkedIn. Optimized for the algorithm.',
  'social-post-optimizer',
  E'I {{surprising_action}} and it {{unexpected_result}}.\n\nHere''s what happened:\n\nLast {{timeframe}}, I was {{situation}}.\nEveryone told me to {{conventional_wisdom}}.\nInstead, I {{contrarian_action}}.\n\nThe result?\n→ {{result_1}}\n→ {{result_2}}\n→ {{result_3}}\n\nThe lesson: {{one_sentence_insight}}\n\n{{question_for_audience}}?\n\n♻️ Repost if this resonates',
  92,
  'content-marketing',
  ARRAY['linkedin', 'thought-leadership', 'storytelling', 'engagement'],
  v_author_id, true, true, 3412, 4.9, 234
),
(
  'Twitter/X Thread Opener',
  'Scroll-stopping first tweet for threads. Uses curiosity gap + promise of value to drive click-through.',
  'social-post-optimizer',
  E'I spent {{timeframe}} studying {{topic}}.\n\nHere are {{number}} lessons that {{benefit}}:\n\n🧵 (thread)',
  87,
  'content-marketing',
  ARRAY['twitter', 'x', 'thread', 'hook'],
  v_author_id, true, true, 1876, 4.4, 98
),
(
  'LinkedIn Carousel Text (Swipe Post)',
  'Compelling carousel/document post intro that drives saves and shares. Optimized for LinkedIn''s algorithm boost on documents.',
  'social-post-optimizer',
  E'Stop {{common_mistake}}.\n\nI analyzed {{number}} {{things}} and found {{number}} patterns that {{positive_outcome}}.\n\nSwipe through to see all {{number}} 👇\n\n(Save this for later — you''ll need it)\n\n#{{hashtag1}} #{{hashtag2}}',
  84,
  'content-marketing',
  ARRAY['linkedin', 'carousel', 'document-post', 'saves'],
  v_author_id, true, true, 1543, 4.3, 72
);

-- ═══════════════════════════════════════════════════════
-- NEWSLETTER GRADER (2 templates)
-- ═══════════════════════════════════════════════════════

INSERT INTO templates (title, description, agent_id, content, score, category, tags, author_id, is_official, is_public, uses_count, rating, rating_count)
VALUES (
  'Weekly Curated Newsletter (3-2-1 Format)',
  'The 3 links + 2 insights + 1 question format that top newsletters use. Scannable, valuable, and drives replies.',
  'newsletter-grader',
  E'Subject: {{number}} {{topic}} {{benefit}} this week\nPreview: Plus: {{teaser_for_hot_take}}\n\nHey {{first_name}},\n\nHappy {{day}}! Here''s your weekly dose of {{topic}}:\n\n📌 3 THINGS WORTH YOUR TIME\n\n1. {{link_title_1}} — {{one_line_why}}\n2. {{link_title_2}} — {{one_line_why}}\n3. {{link_title_3}} — {{one_line_why}}\n\n💡 2 QUICK INSIGHTS\n\n→ {{insight_1}}\n→ {{insight_2}}\n\n🤔 1 QUESTION FOR YOU\n\n{{thought_provoking_question}}?\n\nHit reply — I read every response.\n\nSee you next {{day}},\n{{name}}\n\nP.S. {{referral_cta_or_bonus}}',
  93,
  'content-marketing',
  ARRAY['newsletter', '3-2-1', 'curated', 'weekly'],
  v_author_id, true, true, 2891, 4.8, 187
),
(
  'Product Launch Announcement Email',
  'Newsletter announcing a new feature/product. Builds anticipation, explains the why, and drives immediate action.',
  'newsletter-grader',
  E'Subject: {{product_name}} is live (and it changes everything about {{topic}})\nPreview: {{number}} months in the making. Here''s what it does.\n\nHey {{first_name}},\n\nBig news today: we just shipped {{product_name}}.\n\nHere''s the TL;DR:\n\n🎯 THE PROBLEM\n{{one_sentence_problem}}\n\n✨ WHAT WE BUILT\n{{what_it_does_in_2_sentences}}\n\n⚡ WHY IT MATTERS TO YOU\n• {{benefit_1}}\n• {{benefit_2}}\n• {{benefit_3}}\n\n→ {{cta_button_text}}: {{link}}\n\nWe''ve been using it internally for {{timeframe}} and {{internal_result}}. Can''t wait to hear what you think.\n\n{{name}}',
  89,
  'content-marketing',
  ARRAY['newsletter', 'launch', 'product', 'announcement'],
  v_author_id, true, true, 1654, 4.6, 112
);

-- ═══════════════════════════════════════════════════════
-- AD COPY GRADER (2 templates)
-- ═══════════════════════════════════════════════════════

INSERT INTO templates (title, description, agent_id, content, score, category, tags, author_id, is_official, is_public, uses_count, rating, rating_count)
VALUES (
  'Facebook Ad — Problem-Agitate-Solve',
  'The PAS framework adapted for Facebook ads. Short, punchy, mobile-optimized with clear CTA.',
  'ad-copy-grader',
  E'Platform: Facebook/Instagram\nTarget: {{audience}}\n\nHeadline: {{number}} {{audience}} fixed their {{problem}} in {{timeframe}}\n\nPrimary Text: Tired of {{painful_symptom}}?\n\nYou''ve tried {{failed_solution_1}} and {{failed_solution_2}}. Nothing sticks.\n\nThat''s because {{root_cause_insight}}.\n\n{{product_name}} does it differently: {{one_sentence_mechanism}}.\n\n→ {{social_proof_stat}}\n\nCTA: {{action_verb}} — Free for 14 days',
  86,
  'sales',
  ARRAY['facebook', 'instagram', 'pas-framework', 'mobile'],
  v_author_id, true, true, 2234, 4.5, 143
),
(
  'Google Search Ad (Responsive)',
  'High-CTR responsive search ad with 3 headline variants and 2 descriptions. Follows Google''s best practices for character limits.',
  'ad-copy-grader',
  E'Platform: Google Search\nTarget: {{search_intent}}\n\nHeadline 1 (30 chars): {{Benefit}} in {{Timeframe}}\nHeadline 2 (30 chars): {{Social Proof Number}} {{Users/Companies}}\nHeadline 3 (30 chars): Try Free — No Card Needed\n\nDescription 1 (90 chars): {{product}} helps {{audience}} {{achieve_outcome}}. {{differentiator}}. Start free today.\nDescription 2 (90 chars): Join {{number}}+ {{audience}} who {{result}}. {{guarantee_or_offer}}. {{urgency}}.\n\nCTA: Sign Up Free',
  83,
  'sales',
  ARRAY['google-ads', 'search', 'responsive', 'ppc'],
  v_author_id, true, true, 1432, 4.2, 88
);

-- ═══════════════════════════════════════════════════════
-- SUPPORT RESPONSE GRADER (2 templates)
-- ═══════════════════════════════════════════════════════

INSERT INTO templates (title, description, agent_id, content, score, category, tags, author_id, is_official, is_public, uses_count, rating, rating_count)
VALUES (
  'Angry Customer De-escalation',
  'Template for responding to frustrated/angry customers. Acknowledges emotion first, then resolves. Proven to reduce churn.',
  'support-response-grader',
  E'Hi {{customer_name}},\n\nI completely understand your frustration — {{acknowledge_specific_issue}} is not the experience you should have, and I''m sorry we let you down here.\n\nI''ve looked into this personally and here''s what happened: {{brief_explanation}}.\n\nHere''s what I''m doing right now to fix it:\n1. {{immediate_action}}\n2. {{timeline_for_resolution}}\n\nTo make this right, I''ve also {{compensation_or_gesture}}.\n\nYou''ll hear from me again by {{specific_time}} with a full update. If you need anything before then, reply to this email directly — it comes straight to me.\n\n{{your_name}}\n{{title}}',
  94,
  'support',
  ARRAY['de-escalation', 'angry-customer', 'retention', 'empathy'],
  v_author_id, true, true, 3201, 4.9, 267
),
(
  'Refund Approval (Graceful)',
  'Approving a refund while maintaining goodwill and leaving the door open for return. No guilt, no friction.',
  'support-response-grader',
  E'Hi {{customer_name}},\n\nAbsolutely — I''ve processed your full refund of {{amount}}. You should see it back in your account within {{timeframe}}.\n\nNo hoops, no questions. You gave us a fair shot and I appreciate that.\n\nIf you don''t mind sharing: was there one thing we could have done differently? Your honest feedback helps us improve for everyone.\n\nYour account will stay active through {{date}} in case you want to export anything. And if you ever want to come back, you''re always welcome — just reply to this email.\n\nWishing you the best,\n{{your_name}}',
  90,
  'support',
  ARRAY['refund', 'retention', 'graceful-exit', 'feedback'],
  v_author_id, true, true, 1876, 4.7, 134
);

-- ═══════════════════════════════════════════════════════
-- RESUME REVIEWER (2 templates)
-- ═══════════════════════════════════════════════════════

INSERT INTO templates (title, description, agent_id, content, score, category, tags, author_id, is_official, is_public, uses_count, rating, rating_count)
VALUES (
  'Software Engineer Resume (STAR Format)',
  'ATS-optimized resume bullet points using Situation-Task-Action-Result format. For mid-senior engineers.',
  'resume-reviewer',
  E'PROFESSIONAL EXPERIENCE\n\n{{Company Name}} | {{Title}} | {{Date Range}}\n\n• Led migration of {{system}} from {{old_tech}} to {{new_tech}}, reducing {{metric}} by {{percentage}} and enabling {{business_outcome}}\n• Designed and implemented {{feature/system}} serving {{scale}} requests/day with {{reliability}}% uptime across {{regions}} regions\n• Mentored {{number}} engineers on {{topic}}, resulting in {{team_outcome}} and {{measurable_improvement}}\n• Reduced {{technical_debt_area}} by {{percentage}} through {{approach}}, saving {{hours}}/week in {{process}}\n\nTECHNICAL SKILLS\n{{languages}} | {{frameworks}} | {{infrastructure}} | {{databases}}',
  87,
  'recruiting',
  ARRAY['resume', 'software-engineer', 'star-format', 'ats'],
  v_author_id, true, true, 4521, 4.6, 312
),
(
  'Career Changer Resume Summary',
  'Professional summary for career changers that bridges past experience to new role. Emphasizes transferable skills.',
  'resume-reviewer',
  E'PROFESSIONAL SUMMARY\n\n{{Target_role}} with {{years}}+ years of {{transferable_domain}} experience. Proven track record in {{transferable_skill_1}}, {{transferable_skill_2}}, and {{transferable_skill_3}}. Recently completed {{credential/certification/project}} in {{new_field}}. Passionate about applying {{unique_perspective}} to {{target_industry}} challenges.\n\nKEY ACHIEVEMENTS\n• {{Achievement_from_past_career_relevant_to_new_role}}\n• {{Learning/project_in_new_field}}\n• {{Quantified_transferable_accomplishment}}',
  82,
  'recruiting',
  ARRAY['resume', 'career-change', 'summary', 'transferable-skills'],
  v_author_id, true, true, 2876, 4.4, 198
);

-- ═══════════════════════════════════════════════════════
-- PITCH DECK REVIEWER (2 templates)
-- ═══════════════════════════════════════════════════════

INSERT INTO templates (title, description, agent_id, content, score, category, tags, author_id, is_official, is_public, uses_count, rating, rating_count)
VALUES (
  'Seed Round Pitch Script (10 Slides)',
  'The standard 10-slide pitch deck narrative for seed-stage startups. Follows the Sequoia framework with modern updates.',
  'pitch-deck-reviewer',
  E'Slide 1 - Hook:\n{{Company}}: {{One-line description that creates curiosity}}\n\nSlide 2 - Problem:\n{{Specific_audience}} waste {{quantified_pain}} every {{timeframe}} because {{root_cause}}. The market has tried {{existing_solutions}} but they fail because {{why_they_fail}}.\n\nSlide 3 - Solution:\n{{Product}} does {{what_it_does}} by {{unique_mechanism}}. In one sentence: {{simple_value_prop}}.\n\nSlide 4 - Demo/How It Works:\n1. {{Step_1}} → 2. {{Step_2}} → 3. {{Outcome}}\n[Include screenshot or demo video link]\n\nSlide 5 - Traction:\n• {{Key_metric_1}}: {{number}} ({{growth_rate}})\n• {{Key_metric_2}}: {{number}}\n• {{Key_metric_3}}: {{number}}\n• Notable: {{press/customer/partnership}}\n\nSlide 6 - Market:\nTAM: ${{tam}}B ({{tam_description}})\nSAM: ${{sam}}B ({{sam_description}})\nWedge: {{how_you_enter_market}}\n\nSlide 7 - Business Model:\n{{How_you_make_money}}. Current {{metric}}: ${{number}}/mo. Unit economics: {{LTV/CAC_or_margin}}.\n\nSlide 8 - Competition:\n[2x2 matrix positioning]\nWe win because: {{moat_1}}, {{moat_2}}\n\nSlide 9 - Team:\n{{Founder_1}}: {{relevant_background}}\n{{Founder_2}}: {{relevant_background}}\nWhy us: {{founder_market_fit_reason}}\n\nSlide 10 - Ask:\nRaising ${{amount}} to {{milestone_1}}, {{milestone_2}}, and {{milestone_3}}.\n18-month runway to {{next_fundraise_trigger}}.',
  90,
  'fundraising',
  ARRAY['pitch-deck', 'seed', 'sequoia-framework', 'fundraising'],
  v_author_id, true, true, 5432, 4.8, 387
),
(
  'Investor Update Email (Monthly)',
  'Monthly investor update template. Keeps investors informed and engaged for follow-on rounds.',
  'pitch-deck-reviewer',
  E'Subject: {{Company}} — {{Month}} Update: {{one_highlight}}\n\nHi everyone,\n\nHere''s the {{month}} update for {{company}}.\n\n📊 KEY METRICS\n• MRR: ${{mrr}} ({{growth}}% MoM)\n• Customers: {{number}} ({{new}} new)\n• Burn: ${{burn}}/mo | Runway: {{months}} months\n\n✅ WINS\n• {{Win_1}}\n• {{Win_2}}\n\n⚠️ CHALLENGES\n• {{Challenge_1}} — our plan: {{mitigation}}\n\n🎯 NEXT MONTH PRIORITIES\n1. {{Priority_1}}\n2. {{Priority_2}}\n3. {{Priority_3}}\n\n🙏 ASKS\n• {{Intro_request_or_help_needed}}\n\nThanks for your continued support.\n\n{{Founder_name}}',
  86,
  'fundraising',
  ARRAY['investor-update', 'monthly', 'fundraising', 'reporting'],
  v_author_id, true, true, 3211, 4.7, 245
);

-- ═══════════════════════════════════════════════════════
-- PROPOSAL ANALYZER (2 templates)
-- ═══════════════════════════════════════════════════════

INSERT INTO templates (title, description, agent_id, content, score, category, tags, author_id, is_official, is_public, uses_count, rating, rating_count)
VALUES (
  'Freelance Web Dev Proposal',
  'Value-based proposal for web development projects. Positions outcomes over hours and protects against scope creep.',
  'proposal-analyzer',
  E'PROPOSAL: {{Project_Name}} for {{Client_Company}}\n\nEXECUTIVE SUMMARY\nBased on our conversation on {{date}}, you need {{outcome_1}} and {{outcome_2}} to {{business_goal}}. Here''s how I''ll deliver that.\n\nTHE OPPORTUNITY\n{{Client}} is currently {{current_state}}. This is costing approximately ${{cost}}/month in {{lost_revenue/time/etc}}. After this project, you''ll have {{future_state}}.\n\nSCOPE OF WORK\n✅ Included:\n• {{Deliverable_1}} — {{measurable_spec}}\n• {{Deliverable_2}} — {{measurable_spec}}\n• {{Deliverable_3}} — {{measurable_spec}}\n• {{Number}} rounds of revisions per deliverable\n\n❌ Not Included:\n• {{Exclusion_1}}\n• {{Exclusion_2}}\n• Additional work at ${{hourly_rate}}/hr via change order\n\nTIMELINE\nWeek 1-2: {{Phase_1}}\nWeek 3-4: {{Phase_2}}\nWeek 5: {{QA_and_launch}}\nBuffer: 1 week built in\n\nINVESTMENT\nTotal: ${{price}}\n• 40% upfront (${{amount}}) to begin\n• 30% at midpoint milestone (${{amount}})\n• 30% on delivery (${{amount}})\n\nLate payments: 1.5%/month after 7 days\nKill fee: Work completed to date + 20%\n\nTERMS\n• IP transfers on final payment\n• Your pre-existing content remains yours\n• 30-day support included post-launch\n\nReady to start? Reply "approved" or schedule a call: {{calendar_link}}',
  92,
  'sales',
  ARRAY['proposal', 'freelance', 'web-dev', 'value-based'],
  v_author_id, true, true, 4123, 4.8, 298
),
(
  'Agency Retainer Proposal',
  'Monthly retainer proposal template for agencies. Focuses on outcomes, includes clear scope boundaries and reporting.',
  'proposal-analyzer',
  E'PROPOSAL: {{Service_Type}} Retainer for {{Client}}\n\nWHY THIS MATTERS\n{{Client}} needs {{outcome}} to {{business_objective}}. Based on {{similar_client}}, we project {{expected_result}} within {{timeframe}}.\n\nMONTHLY DELIVERABLES\n• {{Deliverable_1}} ({{quantity}}/month)\n• {{Deliverable_2}} ({{quantity}}/month)\n• {{Deliverable_3}} (ongoing)\n• Monthly reporting + 1 strategy call\n\nNOT INCLUDED\n• {{Out_of_scope_1}}\n• {{Out_of_scope_2}}\n• Additional work: scoped separately via SOW addendum\n\nINVESTMENT\n${{monthly_fee}}/month ({{minimum_term}}-month minimum)\nReview and adjust scope quarterly.\n\nREPORTING\nMonthly report by the 5th including:\n• KPI dashboard ({{metric_1}}, {{metric_2}}, {{metric_3}})\n• Work completed\n• Recommendations for next month\n\nGUARANTEE\nIf we don''t hit {{minimum_kpi}} within 90 days, next month is free.\n\nNEXT STEPS\n1. Reply "let''s go" to accept\n2. We send onboarding questionnaire\n3. Kick off within {{days}} business days',
  88,
  'sales',
  ARRAY['proposal', 'agency', 'retainer', 'monthly'],
  v_author_id, true, true, 2654, 4.6, 176
);

-- ═══════════════════════════════════════════════════════
-- TECHNICAL DOCS REVIEWER (2 templates)
-- ═══════════════════════════════════════════════════════

INSERT INTO templates (title, description, agent_id, content, score, category, tags, author_id, is_official, is_public, uses_count, rating, rating_count)
VALUES (
  'REST API Endpoint Documentation',
  'Complete endpoint documentation following Stripe/Twilio best practices. Includes request, response, errors, and code example.',
  'technical-docs-reviewer',
  E'## {{Method}} {{Path}}\n\n{{One_sentence_description}}.\n\n### Authentication\nRequires `Authorization: Bearer <api_key>` header.\n\n### Request\n\n| Parameter | Type | Required | Description |\n|-----------|------|----------|-------------|\n| {{param_1}} | {{type}} | Yes | {{description}} |\n| {{param_2}} | {{type}} | No | {{description}} (default: {{default}}) |\n\n### Example Request\n\n```bash\ncurl -X {{METHOD}} https://api.{{domain}}/v1/{{path}} \\\n  -H "Authorization: Bearer sk_test_..." \\\n  -H "Content-Type: application/json" \\\n  -d ''{\n    "{{param_1}}": "{{example_value}}",\n    "{{param_2}}": {{example_value}}\n  }''\n```\n\n### Response (200 OK)\n\n```json\n{\n  "id": "{{resource}}_abc123",\n  "{{field_1}}": "{{value}}",\n  "{{field_2}}": {{value}},\n  "created_at": "2024-01-15T10:30:00Z"\n}\n```\n\n### Errors\n\n| Code | Description |\n|------|-------------|\n| 400 | {{validation_error_description}} |\n| 401 | Invalid or missing API key |\n| 404 | {{resource}} not found |\n| 429 | Rate limit exceeded ({{limit}}/min) |\n\n### Notes\n- {{Important_behavior_note}}\n- Rate limit: {{number}} requests per minute',
  88,
  'product',
  ARRAY['api-docs', 'rest', 'developer', 'documentation'],
  v_author_id, true, true, 3654, 4.7, 256
),
(
  'README.md (Open Source Project)',
  'Complete README template for open source projects. Covers install, usage, contributing, and license.',
  'technical-docs-reviewer',
  E'# {{Project Name}}\n\n{{One_line_description}}\n\n[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)\n[![npm version](https://img.shields.io/npm/v/{{package}}.svg)](https://www.npmjs.com/package/{{package}})\n\n## Why?\n\n{{2_sentence_problem_and_solution}}\n\n## Quick Start\n\n```bash\nnpm install {{package}}\n```\n\n```javascript\nimport { {{main_export}} } from ''{{package}}'';\n\nconst result = {{main_export}}({{example_input}});\nconsole.log(result); // {{expected_output}}\n```\n\n## Features\n\n- ✅ {{Feature_1}}\n- ✅ {{Feature_2}}\n- ✅ {{Feature_3}}\n\n## API Reference\n\n### `{{function_name}}({{params}})`\n\n{{Description}}\n\n| Param | Type | Default | Description |\n|-------|------|---------|-------------|\n| {{param}} | `{{type}}` | {{default}} | {{description}} |\n\n**Returns:** `{{return_type}}`\n\n## Contributing\n\n1. Fork the repo\n2. Create your branch (`git checkout -b feat/amazing-feature`)\n3. Commit (`git commit -m ''feat: add amazing feature''`)\n4. Push (`git push origin feat/amazing-feature`)\n5. Open a Pull Request\n\n## License\n\nMIT © {{author}}',
  85,
  'product',
  ARRAY['readme', 'open-source', 'documentation', 'github'],
  v_author_id, true, true, 5123, 4.5, 342
);

END $$;
