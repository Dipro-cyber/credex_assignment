# PRICING DATA — AI Spend Audit

Every pricing number used in the audit engine is traced to an official vendor URL.
All prices verified week of May 12, 2026.

Format: `Plan: $X/user/month — source URL — verified YYYY-MM-DD`

---

## Cursor

- Hobby: $0/month — https://cursor.com/pricing — verified 2026-05-12
- Pro: $20/user/month — https://cursor.com/pricing — verified 2026-05-12
- Business: $40/user/month — https://docs.cursor.com/en/account/teams/pricing — verified 2026-05-12
- Enterprise: custom pricing — https://www.cursor.com/enterprise — verified 2026-05-12

**Notes:** In mid-2025 Cursor moved from request-based to credit-pool pricing. Pro includes $20/mo of usage credits. Business includes $20/mo of usage credits per seat plus admin controls and centralized billing.

---

## GitHub Copilot

- Free: $0 (limited, 50 premium requests/mo) — https://github.com/features/copilot/plans — verified 2026-05-12
- Pro (Individual): $10/user/month — https://docs.github.com/copilot/concepts/billing/billing-for-individuals — verified 2026-05-12
- Pro+: $39/user/month — https://docs.github.com/copilot/concepts/billing/billing-for-individuals — verified 2026-05-12
- Business: $19/user/month — https://docs.github.com/en/billing/concepts/product-billing/github-copilot-licenses — verified 2026-05-12
- Enterprise: $39/user/month — https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/billing/organizations-and-enterprises — verified 2026-05-12

**Notes:** New sign-ups for Copilot Pro/Pro+ temporarily paused as of April 20, 2026 per GitHub announcement. Existing subscribers unaffected. The audit engine uses Individual ($10) and Business ($19) as the primary comparison points.

---

## Claude (Anthropic)

- Free: $0 — https://claude.ai/upgrade — verified 2026-05-12
- Pro: $20/user/month (or $17/mo annual) — https://www.anthropic.com/pricing — verified 2026-05-12
- Max 5x: $100/user/month — https://www.anthropic.com/max — verified 2026-05-12
- Max 20x: $200/user/month — https://www.anthropic.com/max — verified 2026-05-12
- Team: $30/user/month month-to-month ($25/user/mo annual), min 5 seats — https://www.anthropic.com/team — verified 2026-05-12
- Enterprise: custom — https://www.anthropic.com/claude/enterprise — verified 2026-05-12
- API: usage-based (per token) — https://www.anthropic.com/pricing — verified 2026-05-12

**Notes:** The audit engine uses $100/seat for Max (the 5x tier) and $30/seat for Team (month-to-month). The 5-seat minimum on Team is a real billing constraint — teams under 5 seats are billed for 5 regardless.

---

## ChatGPT (OpenAI)

- Free: $0 — https://openai.com/chatgpt/pricing — verified 2026-05-12
- Plus: $20/user/month — https://openai.com/chatgpt/pricing — verified 2026-05-12
- Team: $30/user/month (min 2 seats) — https://openai.com/chatgpt/pricing — verified 2026-05-12
- Enterprise: custom — https://openai.com/chatgpt/enterprise — verified 2026-05-12
- API: usage-based (per token) — https://openai.com/api/pricing — verified 2026-05-12

---

## Anthropic API (direct)

- Usage-based, per token — https://www.anthropic.com/pricing — verified 2026-05-12

**Sample rates (claude-3-5-sonnet-20241022):**
- Input: $3.00/MTok
- Output: $15.00/MTok

The audit engine does not calculate per-token savings — it flags high API spend for Credex credits which provide bulk rate discounts of 20–28% depending on volume commitment.

---

## OpenAI API (direct)

- Usage-based, per token — https://openai.com/api/pricing — verified 2026-05-12

**Sample rates (gpt-4o):**
- Input: $2.50/MTok
- Output: $10.00/MTok

Same approach as Anthropic API — high spend flagged for Credex credits (18–25% savings).

---

## Gemini (Google)

- Pro (Google One AI Premium): $19.99/month flat — https://one.google.com/about/ai-premium — verified 2026-05-12
- Ultra (Google AI Ultra): $249.99/month flat — https://one.google.com/about/ai-premium — verified 2026-05-12
- API: usage-based — https://ai.google.dev/pricing — verified 2026-05-12

**Notes:** Gemini Pro and Ultra are flat monthly subscriptions per user, not per-seat enterprise plans. The audit engine treats them as per-seat for multi-user teams.

---

## Windsurf (Codeium)

- Free: $0 — https://windsurf.com/pricing — verified 2026-05-12
- Pro: $20/user/month — https://windsurf.com/pricing — verified 2026-05-12
- Teams: $40/user/month — https://windsurf.com/pricing — verified 2026-05-12
- Enterprise: custom — https://windsurf.com/pricing — verified 2026-05-12

**Notes:** Windsurf raised Pro from $15 to $20/month in March 2026 (matching Cursor Pro). Teams raised from $35 to $40/user/month at the same time. Pricing in `src/lib/audit/pricing.ts` updated to reflect current rates.
