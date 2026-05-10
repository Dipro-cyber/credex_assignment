# PROMPTS — AI Spend Audit

All LLM prompts used in the tool, with rationale and iteration notes.

---

## Feature 6 — Personalized Audit Summary

**Location:** `src/lib/ai/summary.ts`

**Model:** `claude-3-5-haiku-20241022`

**Why this model:** Fast (~1s p50 latency), cheap ($0.80/MTok input), and
sufficient for ~100-word summaries. claude-3-5-sonnet would produce marginally
better prose but at 5× the cost and 2× the latency — not worth it for a
one-paragraph summary on a free tool.

---

### System Prompt

```
You are a concise financial advisor specialising in AI tool costs for startups.
Write a single paragraph of exactly 80–110 words.
Tone: direct, specific, no fluff. Address the reader as "your team".
Do not use bullet points, headers, or markdown formatting.
Do not mention Credex by name — refer to it only as "infrastructure credits" if relevant.
Focus on the 1–2 biggest savings opportunities and what action to take.
End with one forward-looking sentence about what the savings could fund instead.
```

**Why written this way:**
- "Exactly 80–110 words" prevents both one-liners and essays. Haiku respects
  hard word count constraints well.
- "Do not mention Credex by name" keeps the summary feeling neutral and
  trustworthy — the Credex CTA is a separate UI element, not baked into the AI copy.
- "Address the reader as 'your team'" makes it feel personalised without
  requiring any PII in the prompt.
- "End with one forward-looking sentence" gives the summary a natural close
  and frames savings as opportunity, not just cost-cutting.

---

### User Prompt Template

```
Team size: {teamSize} people
Primary use case: {useCase}
Total monthly savings identified: ${totalMonthlySavings}
Annual savings: ${totalAnnualSavings}

Tool breakdown:
- {toolLabel} ({planLabel}, {seats} seat(s), ${monthlySpend}/mo): {saving or "already optimal"}
...

Write a personalised 80–110 word summary paragraph for this team.
```

**Why structured this way:**
- Structured data (not prose) in the user turn lets the model focus on
  synthesis rather than parsing. Haiku is better at this than at extracting
  from unstructured text.
- Including "already optimal" lines gives the model context about what's
  working — prevents it from inventing problems.
- No PII (email, company name) is included — only tool data and numbers.

---

### Fallback Template

When the API is unavailable (no key, timeout, non-2xx), a deterministic
template is returned. It reads naturally and users should not notice a
difference in most cases.

**Zero savings fallback:**
> "Your team of {N} is running a tight AI stack for {useCase} work — no
> obvious overspend found. The plans you're on match your team size well.
> Keep an eye on seat counts as you grow, and revisit this audit if you add
> new tools or your usage patterns shift significantly."

**Savings found fallback:**
> "Your team of {N} is spending more than necessary on AI tools for {useCase}
> work. The biggest opportunity is {topTool} — {reason}. Acting on the top
> recommendations would save your team ${monthly}/month (${annual}/year).
> That's enough to fund {N} months of a junior engineer's tooling budget, or
> reinvest directly into product development."

---

### What was tried that didn't work

1. **Asking for bullet points** — the model produced well-formatted bullets
   but they looked out of place next to the card-based UI. Switched to prose.

2. **Including the full reason strings from the audit engine** — the model
   would sometimes just paraphrase them verbatim. Switched to including only
   the recommended action, which forces the model to synthesise rather than copy.

3. **Using `claude-3-haiku-20240307`** (older haiku) — word count adherence
   was inconsistent. `claude-3-5-haiku-20241022` is noticeably better at
   following the 80–110 word constraint.

4. **Streaming the response** — tried using the streaming API to show words
   appearing in real time. The UX felt gimmicky for a one-paragraph summary.
   Switched to Suspense with a skeleton loader instead — cleaner.
