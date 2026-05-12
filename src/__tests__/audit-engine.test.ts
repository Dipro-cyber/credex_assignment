/**
 * Audit engine tests.
 *
 * Tests the hardcoded rules in src/lib/audit/rules.ts and the
 * orchestrator in src/lib/audit/engine.ts.
 *
 * Run: npm run test:run
 * Watch: npm test
 */

import { describe, it, expect } from "vitest";
import { auditTool } from "@/lib/audit/rules";
import { runAudit } from "@/lib/audit/engine";
import type { ToolEntry, AuditFormState } from "@/types/audit";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function entry(
  toolId: ToolEntry["toolId"],
  planId: ToolEntry["planId"],
  monthlySpend: number,
  seats = 1
): ToolEntry {
  return { toolId, planId, monthlySpend, seats };
}

const codingCtx = { teamSize: 10, useCase: "coding" as const };
const writingCtx = { teamSize: 10, useCase: "writing" as const };
const mixedCtx = { teamSize: 10, useCase: "mixed" as const };

// ---------------------------------------------------------------------------
// Test 1: Plan fit — Cursor Business overkill for small team
// ---------------------------------------------------------------------------

describe("Cursor", () => {
  it("flags Business plan as overkill for teams under 10 seats", () => {
    const result = auditTool(entry("cursor", "business", 240, 6), codingCtx);

    expect(result.recommendationType).toBe("downgrade_plan");
    expect(result.monthlySavings).toBeGreaterThan(0);
    // Business is $40/seat, Pro is $20/seat — 6 seats saves $120/mo
    expect(result.monthlySavings).toBe(120);
  });

  it("keeps Business plan for teams of 10+ seats", () => {
    const result = auditTool(entry("cursor", "business", 400, 10), codingCtx);
    // 10 seats × $40 = $400 — exactly at threshold, no downgrade
    expect(result.recommendationType).toBe("right_plan");
    expect(result.monthlySavings).toBe(0);
  });

  it("suggests Windsurf for coding teams on Pro plan with 3+ seats", () => {
    // 5 seats × $20 = $100/mo on Cursor Pro
    // Windsurf Pro = 5 × $15 = $75/mo → saves $25
    const result = auditTool(entry("cursor", "pro", 100, 5), codingCtx);
    expect(result.recommendationType).toBe("switch_tool");
    expect(result.monthlySavings).toBe(25);
  });

  it("does NOT suggest Windsurf for writing use case", () => {
    const result = auditTool(entry("cursor", "pro", 100, 5), writingCtx);
    // Writing teams shouldn't be pushed to a coding-only tool
    expect(result.recommendationType).not.toBe("switch_tool");
  });

  it("returns right_plan for Cursor Pro with 1 seat (savings < $20 threshold)", () => {
    // 1 seat × $20 = $20 on Cursor Pro, Windsurf = $15 → saves $5 (below $20 threshold)
    const result = auditTool(entry("cursor", "pro", 20, 1), codingCtx);
    expect(result.recommendationType).toBe("right_plan");
    expect(result.monthlySavings).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Test 2: GitHub Copilot plan fit
// ---------------------------------------------------------------------------

describe("GitHub Copilot", () => {
  it("downgrades Enterprise to Business for teams under 50 seats", () => {
    // 10 seats × $39 = $390, Business = 10 × $19 = $190 → saves $200
    const result = auditTool(
      entry("github_copilot", "enterprise", 390, 10),
      codingCtx
    );
    expect(result.recommendationType).toBe("downgrade_plan");
    expect(result.monthlySavings).toBe(200);
  });

  it("downgrades Business to Individual for 1-3 seats", () => {
    // 2 seats × $19 = $38, Individual = 2 × $10 = $20 → saves $18
    const result = auditTool(
      entry("github_copilot", "business", 38, 2),
      codingCtx
    );
    expect(result.recommendationType).toBe("downgrade_plan");
    expect(result.monthlySavings).toBe(18);
  });

  it("flags Copilot for writing use case as wrong tool", () => {
    const result = auditTool(
      entry("github_copilot", "business", 190, 10),
      writingCtx
    );
    expect(result.recommendationType).toBe("switch_tool");
  });

  it("keeps Business plan for 4+ seats on coding use case", () => {
    // 4 seats × $19 = $76 — correct price, coding use case
    const result = auditTool(
      entry("github_copilot", "business", 76, 4),
      codingCtx
    );
    expect(result.recommendationType).toBe("right_plan");
    expect(result.monthlySavings).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Test 3: Claude plan fit
// ---------------------------------------------------------------------------

describe("Claude", () => {
  it("downgrades Max to Team for 3+ seats", () => {
    // 3 seats × $100 = $300, Team = 3 × $30 = $90 → saves $210
    const result = auditTool(entry("claude", "max", 300, 3), mixedCtx);
    expect(result.recommendationType).toBe("downgrade_plan");
    expect(result.monthlySavings).toBe(210);
  });

  it("downgrades Team to Pro when fewer than 5 seats (min seat trap)", () => {
    // Team plan has 5-seat minimum = $150/mo
    // 3 seats on Pro = $60/mo → saves $90
    const result = auditTool(entry("claude", "team", 150, 3), mixedCtx);
    expect(result.recommendationType).toBe("downgrade_plan");
    expect(result.monthlySavings).toBe(90);
  });

  it("flags Claude API spend ≥$200 for Credex credits", () => {
    const result = auditTool(entry("claude", "api", 400, 1), mixedCtx);
    expect(result.recommendationType).toBe("credex_credits");
    expect(result.monthlySavings).toBe(100); // 25% of $400
  });

  it("does NOT flag Claude API spend under $200", () => {
    const result = auditTool(entry("claude", "api", 150, 1), mixedCtx);
    expect(result.recommendationType).toBe("right_plan");
    expect(result.monthlySavings).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Test 4: ChatGPT plan fit
// ---------------------------------------------------------------------------

describe("ChatGPT", () => {
  it("downgrades Team to Plus for 2 seats", () => {
    // 2 seats × $30 = $60, Plus = 2 × $20 = $40 → saves $20
    const result = auditTool(entry("chatgpt", "team", 60, 2), mixedCtx);
    expect(result.recommendationType).toBe("downgrade_plan");
    expect(result.monthlySavings).toBe(20);
  });

  it("flags ChatGPT API spend ≥$200 for Credex credits", () => {
    const result = auditTool(entry("chatgpt", "api", 500, 1), mixedCtx);
    expect(result.recommendationType).toBe("credex_credits");
    expect(result.monthlySavings).toBe(100); // 20% of $500
  });
});

// ---------------------------------------------------------------------------
// Test 5: Anthropic API direct
// ---------------------------------------------------------------------------

describe("Anthropic API", () => {
  it("recommends Credex credits at $500+ spend (28% savings)", () => {
    const result = auditTool(
      entry("anthropic_api", "api", 1000, 1),
      mixedCtx
    );
    expect(result.recommendationType).toBe("credex_credits");
    expect(result.monthlySavings).toBe(280); // 28% of $1000
  });

  it("recommends Credex credits at $200-499 spend (20% savings)", () => {
    const result = auditTool(
      entry("anthropic_api", "api", 300, 1),
      mixedCtx
    );
    expect(result.recommendationType).toBe("credex_credits");
    expect(result.monthlySavings).toBe(60); // 20% of $300
  });

  it("returns right_plan for spend under $200", () => {
    const result = auditTool(
      entry("anthropic_api", "api", 100, 1),
      mixedCtx
    );
    expect(result.recommendationType).toBe("right_plan");
    expect(result.monthlySavings).toBe(0);
  });

  it("returns right_plan for zero spend", () => {
    const result = auditTool(
      entry("anthropic_api", "api", 0, 1),
      mixedCtx
    );
    expect(result.recommendationType).toBe("right_plan");
    expect(result.monthlySavings).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Test 6: OpenAI API direct
// ---------------------------------------------------------------------------

describe("OpenAI API", () => {
  it("recommends Credex credits at $500+ spend (25% savings)", () => {
    const result = auditTool(
      entry("openai_api", "api", 800, 1),
      mixedCtx
    );
    expect(result.recommendationType).toBe("credex_credits");
    expect(result.monthlySavings).toBe(200); // 25% of $800
  });
});

// ---------------------------------------------------------------------------
// Test 7: Windsurf plan fit
// ---------------------------------------------------------------------------

describe("Windsurf", () => {
  it("downgrades Teams to Pro for fewer than 5 seats", () => {
    // 3 seats × $35 = $105, Pro = 3 × $15 = $45 → saves $60
    const result = auditTool(entry("windsurf", "teams", 105, 3), codingCtx);
    expect(result.recommendationType).toBe("downgrade_plan");
    expect(result.monthlySavings).toBe(60);
  });

  it("flags Windsurf for non-coding use case", () => {
    const result = auditTool(entry("windsurf", "pro", 75, 5), writingCtx);
    expect(result.recommendationType).toBe("switch_tool");
  });

  it("keeps Teams plan for 5+ seats on coding use case", () => {
    // 5 seats × $35 = $175 — correct price
    const result = auditTool(entry("windsurf", "teams", 175, 5), codingCtx);
    expect(result.recommendationType).toBe("right_plan");
  });
});

// ---------------------------------------------------------------------------
// Test 8: Gemini plan fit
// ---------------------------------------------------------------------------

describe("Gemini", () => {
  it("downgrades Ultra to Pro for teams (large savings)", () => {
    // 2 seats × $249.99 = $499.98, Pro = 2 × $19.99 = $39.98 → saves $460
    const result = auditTool(entry("gemini", "ultra", 500, 2), mixedCtx);
    expect(result.recommendationType).toBe("downgrade_plan");
    expect(result.monthlySavings).toBeGreaterThan(400);
  });
});

// ---------------------------------------------------------------------------
// Test 9: Engine totals calculation
// ---------------------------------------------------------------------------

describe("runAudit — totals", () => {
  it("correctly sums totalMonthlySavings across all tools", () => {
    const formState: AuditFormState = {
      teamSize: 10,
      useCase: "mixed",
      tools: [
        // Cursor Business 6 seats → saves $120
        entry("cursor", "business", 240, 6),
        // Copilot Enterprise 10 seats → saves $200
        entry("github_copilot", "enterprise", 390, 10),
        // Anthropic API $500 → saves $140 (28%)
        entry("anthropic_api", "api", 500, 1),
      ],
    };

    const result = runAudit(formState);

    expect(result.totalMonthlySavings).toBe(120 + 200 + 140);
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });

  it("returns zero savings when all tools are on optimal plans", () => {
    const formState: AuditFormState = {
      teamSize: 5,
      useCase: "coding",
      tools: [
        // Cursor Pro 1 seat — optimal (savings < $20 threshold)
        entry("cursor", "pro", 20, 1),
        // Windsurf Pro 1 seat — optimal
        entry("windsurf", "pro", 15, 1),
      ],
    };

    const result = runAudit(formState);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.totalAnnualSavings).toBe(0);
  });

  it("generates a unique UUID for each audit run", () => {
    const formState: AuditFormState = {
      teamSize: 5,
      useCase: "mixed",
      tools: [entry("cursor", "pro", 20, 1)],
    };

    const a = runAudit(formState);
    const b = runAudit(formState);

    expect(a.id).not.toBe(b.id);
    // UUID v4 format
    expect(a.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("sets personalizedSummary to null (AI summary added separately)", () => {
    const formState: AuditFormState = {
      teamSize: 5,
      useCase: "mixed",
      tools: [entry("cursor", "pro", 20, 1)],
    };

    const result = runAudit(formState);
    expect(result.personalizedSummary).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Test 10: Edge cases
// ---------------------------------------------------------------------------

describe("Edge cases", () => {
  it("handles zero spend gracefully — no negative savings", () => {
    const result = auditTool(entry("cursor", "business", 0, 5), codingCtx);
    // 0 - 5*20 = -100 → should be clamped to 0
    expect(result.monthlySavings).toBeGreaterThanOrEqual(0);
  });

  it("handles single seat correctly for all tools", () => {
    const tools: ToolEntry["toolId"][] = [
      "cursor", "github_copilot", "claude", "chatgpt",
      "anthropic_api", "openai_api", "gemini", "windsurf",
    ];

    for (const toolId of tools) {
      // Pick a valid plan for each tool
      const planMap: Record<string, ToolEntry["planId"]> = {
        cursor: "pro",
        github_copilot: "individual",
        claude: "pro",
        chatgpt: "plus",
        anthropic_api: "api",
        openai_api: "api",
        gemini: "pro",
        windsurf: "pro",
      };

      const result = auditTool(
        entry(toolId, planMap[toolId], 20, 1),
        mixedCtx
      );

      // Should always return a valid result — never throw
      expect(result.toolId).toBe(toolId);
      expect(result.monthlySavings).toBeGreaterThanOrEqual(0);
      expect(result.reason).toBeTruthy();
      expect(result.recommendedAction).toBeTruthy();
    }
  });

  it("runAudit handles empty tools array", () => {
    const formState: AuditFormState = {
      teamSize: 5,
      useCase: "mixed",
      tools: [],
    };

    const result = runAudit(formState);
    expect(result.toolResults).toHaveLength(0);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.totalAnnualSavings).toBe(0);
  });
});
