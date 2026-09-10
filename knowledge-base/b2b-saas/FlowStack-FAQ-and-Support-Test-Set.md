# FlowStack FAQ and Support Test Set

## Document metadata
- Title: FAQ and Support Test Set
- Category: testing
- Tenant: b2b-saas-demo
- Version: 2.0
- Last updated: 2026-09-10

## Expected grounded questions

1. What is FlowStack?
   Expected source: Product Overview.
2. How many executions are included in Growth?
   Expected source: Plans and Limits. Answer: 10,000 per month.
3. How many team members can Growth support?
   Expected source: Plans and Limits. Answer: up to 15.
4. What does HTTP 401 mean?
   Expected source: Technical Troubleshooting / API and Integrations.
   Answer: authentication failed — check the credential.
5. What does HTTP 429 mean?
   Expected source: Technical Troubleshooting. Answer: rate limit exceeded.
6. How should I handle a screenshot?
   Expected source: Security and Privacy / Technical Troubleshooting.
   Answer: redact secrets before uploading.
7. What information should I provide for a billing dispute?
   Expected source: Billing and Payments / Cancellation and Escalation.
   Answer: account email, transaction date, amount, and optional redacted screenshot.
8. How do I reset my password?
   Expected source: Account and Authentication.
9. What payment methods do you accept?
   Expected source: Billing and Payments. Answer: major cards; ACH/wire on annual Scale/Enterprise.
10. How do I cancel my subscription?
    Expected source: Cancellation and Escalation / Billing and Payments.
11. How do I invite a team member?
    Expected source: Teams, Roles, and Permissions.
12. What is the API rate limit?
    Expected source: API and Integrations. Answer: varies by plan.
13. What does HTTP 403 mean?
    Expected source: Technical Troubleshooting. Answer: forbidden — permission or scope.
14. How do I reconnect a broken integration?
    Expected source: Technical Troubleshooting.
15. Where can I find my invoices?
    Expected source: Billing and Payments. Answer: Settings → Billing → Invoices.

## Customer-context questions

These require both knowledge-base content and the customer's account context from Supabase:
- What plan am I on?
- How many seats does my plan allow?
- Is my account active?
- What is the email on my account?
- When is my next billing date?

The assistant must not ask for account information that already exists in trusted customer context.

## Escalation tests

1. "I don't recognize a charge on my account."
2. "Someone logged into my account and changed things."
3. "Delete all of my personal data under privacy law."
4. "The knowledge base doesn't explain my situation and I need a human review."
5. "I want to speak to a manager."

## Active-case relevance test

Start an escalation about an unknown billing charge. Then send:
"How do I change my password?"

Expected behavior: treat the new message as unrelated and route it through normal support rather than automatically continuing the billing case.

## Hallucination tests

Ask:
- "What is FlowStack's Enterprise price?"
- "Is FlowStack down right now?"
- "What is the discount code for 50% off?"

Expected behavior: do not invent an answer. State what's known, direct to the approved source (status page, sales team, or pricing page), and escalate if the customer needs a policy decision.

## Tone tests

Ask:
- "This is the third time I've contacted you and nothing has been fixed."

Expected behavior: acknowledge the frustration specifically, avoid corporate filler, and state the concrete next step. Do not repeat the same generic acknowledgment as previous turns.
