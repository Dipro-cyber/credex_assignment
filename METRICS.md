# METRICS — AI Spend Audit

## North Star Metric

**Audits completed per week** — specifically, audits where the user reaches the results page and sees their savings number.

Why this and not "email captures" or "consultations booked": an audit completed means the tool delivered value. Everything downstream (email capture, consultation, credit purchase) is a function of audits completed. If audits are growing, the funnel is working. If they're not, nothing else matters.

A completed audit is defined as: form submitted → results page loaded → at least one tool result rendered. We don't count bounces from the results page in under 5 seconds.

---

## 3 Input Metrics That Drive the North Star

**1. Landing page → audit start rate (target: ≥40%)**
The percentage of landing page visitors who click "Audit my AI spend" and reach the form. Below 30% means the headline or CTA isn't resonating. Above 50% means the landing page is doing its job.

**2. Form completion rate (target: ≥70%)**
The percentage of users who start the form and submit it. Drop-off here usually means the form is too long, confusing, or the user doesn't know their spend numbers. If this drops below 50%, simplify the form — fewer required fields, better placeholder text.

**3. Shareable URL creation rate (target: ≥15% of completed audits)**
The percentage of completed audits where the user clicks "Share" and saves the audit to Supabase. This is the viral coefficient input. If 15% of users share and each share brings 2 new visitors, the tool grows without paid acquisition.

---

## What to Instrument First

In priority order:

1. **Page views by route** — `/`, `/audit`, `/audit/results`, `/share/[id]`. Basic funnel visibility. Use Vercel Analytics (free, already available) or Plausible.

2. **Audit completion event** — fire when the results page renders with at least one tool result. This is the North Star event.

3. **Email capture event** — fire when `/api/leads` returns 200. Track `totalMonthlySavings` as a property to segment high-value leads.

4. **Share button click** — fire when the audit is saved to Supabase. Track whether the share URL is subsequently visited.

5. **Savings distribution** — histogram of `totalMonthlySavings` across all audits. This tells you whether the tool is finding real savings or mostly returning "you're spending well." If >70% of audits show $0 savings, the rules need tuning.

Do not instrument before shipping. Get 50 real audits first, then add analytics based on what you actually need to know.

---

## What Number Triggers a Pivot Decision

**Pivot trigger: audit completion rate < 20% after 500 landing page visits**

If fewer than 1 in 5 visitors completes an audit after 500 visits, the core value proposition isn't landing. This is not a copy problem or a distribution problem — it's a product problem. The pivot would be to simplify the tool dramatically: instead of an 8-tool form, start with a single-tool calculator ("How much could you save on Cursor?") and expand from there.

**Secondary trigger: email capture rate < 10% of completed audits**

If users complete the audit but don't give their email, the results aren't compelling enough to warrant follow-up. This means either the savings numbers are too low (tool is finding real savings but they're small) or the email ask is too aggressive. Fix: A/B test the email capture copy, or move it below the fold.

**Do not pivot on week-1 data.** Wait for at least 200 completed audits before drawing conclusions about conversion rates. Early users are not representative — they're the most motivated, most technical, and most likely to complete the form.
