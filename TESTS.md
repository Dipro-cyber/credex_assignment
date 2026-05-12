# TESTS — AI Spend Audit

## Running All Tests

```bash
npm run test:run        # single run (CI mode)
npm test                # watch mode (development)
npm run test:coverage   # with coverage report
```

## Test File

| File | What it covers |
|------|---------------|
| `src/__tests__/audit-engine.test.ts` | Audit engine rules + totals calculation |

## Test Count: 31 tests across 10 describe blocks

---

## Cursor (5 tests)

| Test | What it checks |
|------|---------------|
| flags Business plan as overkill for teams under 10 seats | `downgrade_plan` triggered, saves $120 for 6 seats |
| keeps Business plan for teams of 10+ seats | No downgrade at exactly 10 seats |
| suggests Windsurf for coding teams on Pro plan with 3+ seats | `switch_tool` triggered, saves $25 for 5 seats |
| does NOT suggest Windsurf for writing use case | Writing teams not pushed to coding-only tool |
| returns right_plan for Cursor Pro with 1 seat | Savings below $20 threshold → no recommendation |

## GitHub Copilot (4 tests)

| Test | What it checks |
|------|---------------|
| downgrades Enterprise to Business for teams under 50 seats | Saves $200 for 10 seats |
| downgrades Business to Individual for 1-3 seats | Saves $18 for 2 seats |
| flags Copilot for writing use case as wrong tool | `switch_tool` for non-coding use case |
| keeps Business plan for 4+ seats on coding use case | No downgrade at correct price |

## Claude (4 tests)

| Test | What it checks |
|------|---------------|
| downgrades Max to Team for 3+ seats | Saves $210 for 3 seats |
| downgrades Team to Pro when fewer than 5 seats | Min seat trap — saves $90 for 3 seats |
| flags Claude API spend ≥$200 for Credex credits | `credex_credits`, 25% savings |
| does NOT flag Claude API spend under $200 | `right_plan` for $150/mo |

## ChatGPT (2 tests)

| Test | What it checks |
|------|---------------|
| downgrades Team to Plus for 2 seats | Saves $20 for 2 seats |
| flags ChatGPT API spend ≥$200 for Credex credits | `credex_credits`, 20% savings |

## Anthropic API (4 tests)

| Test | What it checks |
|------|---------------|
| recommends Credex credits at $500+ spend | 28% savings = $280 on $1000 |
| recommends Credex credits at $200-499 spend | 20% savings = $60 on $300 |
| returns right_plan for spend under $200 | No recommendation below threshold |
| returns right_plan for zero spend | Edge case — no crash |

## OpenAI API (1 test)

| Test | What it checks |
|------|---------------|
| recommends Credex credits at $500+ spend | 25% savings = $200 on $800 |

## Windsurf (3 tests)

| Test | What it checks |
|------|---------------|
| downgrades Teams to Pro for fewer than 5 seats | Saves $60 for 3 seats |
| flags Windsurf for non-coding use case | `switch_tool` for writing teams |
| keeps Teams plan for 5+ seats on coding use case | No downgrade at correct price |

## Gemini (1 test)

| Test | What it checks |
|------|---------------|
| downgrades Ultra to Pro for teams | Saves $460+ for 2 seats |

## runAudit — totals (4 tests)

| Test | What it checks |
|------|---------------|
| correctly sums totalMonthlySavings across all tools | $120 + $200 + $140 = $460 |
| returns zero savings when all tools are on optimal plans | No false positives |
| generates a unique UUID for each audit run | UUIDs differ, match v4 format |
| sets personalizedSummary to null | AI summary added separately |

## Edge cases (3 tests)

| Test | What it checks |
|------|---------------|
| handles zero spend gracefully | monthlySavings never negative |
| handles single seat correctly for all 8 tools | No crashes, valid output for every tool |
| runAudit handles empty tools array | Zero totals, no crash |
