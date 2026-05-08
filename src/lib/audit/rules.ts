/**
 * Audit rules for each tool.
 *
 * Each rule function takes a ToolEntry + team context and returns a
 * ToolAuditResult. Rules are hardcoded — NO AI is used here.
 *
 * Rule priority (applied in order, first match wins):
 *   1. Plan too large for team size → downgrade_plan
 *   2. Overpaying vs. expected price → downgrade_plan
 *   3. Cheaper alternative tool for use case → switch_tool
 *   4. API spend that Credex credits could reduce → credex_credits
 *   5. Already optimal → right_plan
 */

import type {
  ToolEntry,
  ToolAuditResult,
  UseCase,
  RecommendationType,
} from "@/types/audit";
import { expectedMonthlyCost } from "./pricing";

interface RuleContext {
  teamSize: number;
  useCase: UseCase;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function result(
  entry: ToolEntry,
  type: RecommendationType,
  action: string,
  savings: number,
  reason: string
): ToolAuditResult {
  return {
    toolId: entry.toolId,
    planId: entry.planId,
    currentMonthlySpend: entry.monthlySpend,
    seats: entry.seats,
    recommendationType: type,
    recommendedAction: action,
    // Round to nearest dollar — avoid $19.999999 noise
    monthlySavings: Math.round(Math.max(0, savings)),
    reason,
  };
}

// ---------------------------------------------------------------------------
// Cursor
// ---------------------------------------------------------------------------

function auditCursor(entry: ToolEntry, ctx: RuleContext): ToolAuditResult {
  const { seats, planId, monthlySpend } = entry;

  // Business plan for small teams: Pro is sufficient for teams < 10
  if (planId === "business" && seats < 10) {
    const savings = monthlySpend - seats * 20;
    return result(
      entry,
      "downgrade_plan",
      "Switch to Cursor Pro ($20/seat)",
      savings,
      `Business plan ($40/seat) is overkill for ${seats} seats — Pro has the same core features for teams under 10.`
    );
  }

  // Enterprise: can't calculate savings, flag for review
  if (planId === "enterprise") {
    return result(
      entry,
      "right_plan",
      "Review enterprise contract",
      0,
      "Enterprise pricing is custom — compare against Pro ($20/seat) or Business ($40/seat) at renewal."
    );
  }

  // Overpaying vs. expected price
  const expected = expectedMonthlyCost(entry.toolId, planId, seats);
  if (expected !== null && monthlySpend > expected * 1.05) {
    const savings = monthlySpend - expected;
    return result(
      entry,
      "downgrade_plan",
      `Verify billing — expected $${expected}/mo`,
      savings,
      `You're paying $${monthlySpend}/mo but the ${planId} plan for ${seats} seats should cost $${expected}/mo.`
    );
  }

  // Coding use case: Windsurf Pro is cheaper than Cursor Pro
  if (
    planId === "pro" &&
    (ctx.useCase === "coding" || ctx.useCase === "mixed") &&
    seats >= 3
  ) {
    const windsurfCost = seats * 15;
    const savings = monthlySpend - windsurfCost;
    if (savings > 20) {
      return result(
        entry,
        "switch_tool",
        `Switch to Windsurf Pro ($15/seat) — save $${Math.round(savings)}/mo`,
        savings,
        `Windsurf Pro ($15/seat) offers comparable AI coding features at 25% less than Cursor Pro ($20/seat).`
      );
    }
  }

  return result(entry, "right_plan", "Optimal plan", 0, "You're on the right plan for your team size.");
}

// ---------------------------------------------------------------------------
// GitHub Copilot
// ---------------------------------------------------------------------------

function auditGithubCopilot(entry: ToolEntry, ctx: RuleContext): ToolAuditResult {
  const { seats, planId, monthlySpend } = entry;

  // Enterprise for small teams: Business is sufficient under 50 seats
  if (planId === "enterprise" && seats < 50) {
    const savings = monthlySpend - seats * 19;
    return result(
      entry,
      "downgrade_plan",
      "Downgrade to Copilot Business ($19/seat)",
      savings,
      `Enterprise ($39/seat) adds SSO and audit logs — unnecessary for teams under 50. Business plan covers all core features.`
    );
  }

  // Business for solo/tiny teams: Individual is cheaper
  if (planId === "business" && seats <= 3) {
    const savings = monthlySpend - seats * 10;
    return result(
      entry,
      "downgrade_plan",
      "Switch to Copilot Individual ($10/seat)",
      savings,
      `For ${seats} seats, Individual plan ($10/seat) has the same features as Business — team management isn't needed at this size.`
    );
  }

  // Non-coding use case: Copilot is coding-only, suggest Claude Team
  if (ctx.useCase === "writing" || ctx.useCase === "research") {
    return result(
      entry,
      "switch_tool",
      "Consider Claude Team ($30/seat) for non-coding work",
      0,
      `GitHub Copilot is optimised for code. For ${ctx.useCase} tasks, Claude Team offers better value.`
    );
  }

  const expected = expectedMonthlyCost(entry.toolId, planId, seats);
  if (expected !== null && monthlySpend > expected * 1.05) {
    return result(
      entry,
      "downgrade_plan",
      `Verify billing — expected $${expected}/mo`,
      monthlySpend - expected,
      `You're paying $${monthlySpend}/mo but ${planId} for ${seats} seats should be $${expected}/mo.`
    );
  }

  return result(entry, "right_plan", "Optimal plan", 0, "You're on the right plan for your team size and use case.");
}

// ---------------------------------------------------------------------------
// Claude
// ---------------------------------------------------------------------------

function auditClaude(entry: ToolEntry, ctx: RuleContext): ToolAuditResult {
  const { seats, planId, monthlySpend } = entry;

  // Max plan: very expensive — only justified for power users
  if (planId === "max" && seats > 2) {
    const savings = monthlySpend - seats * 30;
    if (savings > 0) {
      return result(
        entry,
        "downgrade_plan",
        `Switch to Claude Team ($30/seat) — save $${Math.round(savings)}/mo`,
        savings,
        `Max plan ($100/seat) is designed for individual power users. For ${seats} seats, Team plan ($30/seat) gives the same model access.`
      );
    }
  }

  // Team plan with fewer than 5 seats: min seat requirement means you're overpaying
  if (planId === "team" && seats < 5) {
    const actualCost = 5 * 30; // billed for 5 minimum
    const proCost = seats * 20;
    const savings = actualCost - proCost;
    return result(
      entry,
      "downgrade_plan",
      `Switch to Claude Pro ($20/seat) — save $${Math.round(savings)}/mo`,
      savings,
      `Team plan has a 5-seat minimum ($150/mo). With only ${seats} seats, Pro plan ($20/seat = $${proCost}/mo) is cheaper.`
    );
  }

  // API: flag for Credex credits
  if (planId === "api" && monthlySpend >= 200) {
    const savings = monthlySpend * 0.25;
    return result(
      entry,
      "credex_credits",
      "Use Credex credits — save ~25% on Anthropic API",
      savings,
      `At $${monthlySpend}/mo on Anthropic API, Credex infrastructure credits can reduce your effective cost by ~25%.`
    );
  }

  // For coding use cases with Pro plan, Windsurf is cheaper
  if (planId === "pro" && ctx.useCase === "coding" && seats >= 5) {
    const windsurfCost = seats * 15;
    const proCost = seats * 20;
    const savings = proCost - windsurfCost;
    if (savings > 20) {
      return result(
        entry,
        "switch_tool",
        `Switch to Windsurf Pro ($15/seat) for coding — save $${Math.round(savings)}/mo`,
        savings,
        `For coding teams, Windsurf Pro ($15/seat) is purpose-built and 25% cheaper than Claude Pro ($20/seat).`
      );
    }
  }

  // Pro for large teams: check for overpayment
  if (planId === "pro" && seats >= 5) {
    const proCost = seats * 20;
    if (monthlySpend > proCost * 1.05) {
      return result(
        entry,
        "downgrade_plan",
        `Verify billing — expected $${proCost}/mo`,
        monthlySpend - proCost,
        `Pro plan for ${seats} seats should cost $${proCost}/mo. You appear to be overpaying.`
      );
    }
    return result(entry, "right_plan", "Optimal plan", 0, `Pro plan is the right choice for ${seats} seats — Team plan costs more per seat.`);
  }

  return result(entry, "right_plan", "Optimal plan", 0, "You're on the right Claude plan for your usage.");
}

// ---------------------------------------------------------------------------
// ChatGPT
// ---------------------------------------------------------------------------

function auditChatGPT(entry: ToolEntry, ctx: RuleContext): ToolAuditResult {
  const { seats, planId, monthlySpend } = entry;

  // Plus for large teams with non-coding use case: Claude Team is cheaper
  if (planId === "plus" && seats >= 5 && ctx.useCase !== "coding") {
    const claudeTeamCost = seats * 30;
    const savings = monthlySpend - claudeTeamCost;
    if (savings > 0) {
      return result(
        entry,
        "switch_tool",
        `Switch to Claude Team ($30/seat) — save $${Math.round(savings)}/mo`,
        savings,
        `For ${ctx.useCase} tasks with ${seats} seats, Claude Team ($30/seat) matches ChatGPT Plus capabilities at a lower total cost.`
      );
    }
  }

  // Team plan for small teams: Plus is cheaper (2×$20 vs 2×$30)
  if (planId === "team" && seats <= 3) {
    const plusCost = seats * 20;
    const savings = monthlySpend - plusCost;
    if (savings > 0) {
      return result(
        entry,
        "downgrade_plan",
        `Switch to ChatGPT Plus ($20/seat) — save $${Math.round(savings)}/mo`,
        savings,
        `Team plan ($30/seat) adds shared workspaces — not needed for ${seats} people. Plus ($20/seat) is sufficient.`
      );
    }
  }

  // API: flag for Credex credits
  if (planId === "api" && monthlySpend >= 200) {
    const savings = monthlySpend * 0.2;
    return result(
      entry,
      "credex_credits",
      "Use Credex credits — save ~20% on OpenAI API",
      savings,
      `At $${monthlySpend}/mo on OpenAI API via ChatGPT, Credex infrastructure credits can reduce your cost by ~20%.`
    );
  }

  const expected = expectedMonthlyCost(entry.toolId, planId, seats);
  if (expected !== null && monthlySpend > expected * 1.05) {
    return result(
      entry,
      "downgrade_plan",
      `Verify billing — expected $${expected}/mo`,
      monthlySpend - expected,
      `You're paying $${monthlySpend}/mo but ${planId} for ${seats} seats should be $${expected}/mo.`
    );
  }

  return result(entry, "right_plan", "Optimal plan", 0, "You're on the right ChatGPT plan.");
}

// ---------------------------------------------------------------------------
// Anthropic API (direct)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function auditAnthropicApi(entry: ToolEntry, _ctx: RuleContext): ToolAuditResult {
  const { monthlySpend } = entry;

  if (monthlySpend >= 500) {
    const savings = monthlySpend * 0.28;
    return result(
      entry,
      "credex_credits",
      "Use Credex credits — save ~28% on Anthropic API",
      savings,
      `At $${monthlySpend}/mo, Credex bulk credits reduce your Anthropic API cost by ~28% — that's $${Math.round(savings)}/mo back.`
    );
  }

  if (monthlySpend >= 200) {
    const savings = monthlySpend * 0.2;
    return result(
      entry,
      "credex_credits",
      "Use Credex credits — save ~20% on Anthropic API",
      savings,
      `At $${monthlySpend}/mo on Anthropic API, Credex credits typically save 20–28% depending on volume.`
    );
  }

  if (monthlySpend > 0) {
    return result(
      entry,
      "right_plan",
      "Spending looks reasonable",
      0,
      `Under $200/mo on Anthropic API — Credex credits become cost-effective above that threshold.`
    );
  }

  return result(entry, "right_plan", "No spend entered", 0, "Enter your monthly API spend to get a recommendation.");
}

// ---------------------------------------------------------------------------
// OpenAI API (direct)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function auditOpenAIApi(entry: ToolEntry, _ctx: RuleContext): ToolAuditResult {
  const { monthlySpend } = entry;

  if (monthlySpend >= 500) {
    const savings = monthlySpend * 0.25;
    return result(
      entry,
      "credex_credits",
      "Use Credex credits — save ~25% on OpenAI API",
      savings,
      `At $${monthlySpend}/mo, Credex bulk credits reduce your OpenAI API cost by ~25% — that's $${Math.round(savings)}/mo back.`
    );
  }

  if (monthlySpend >= 200) {
    const savings = monthlySpend * 0.18;
    return result(
      entry,
      "credex_credits",
      "Use Credex credits — save ~18% on OpenAI API",
      savings,
      `At $${monthlySpend}/mo on OpenAI API, Credex credits typically save 18–25% depending on volume.`
    );
  }

  if (monthlySpend > 0) {
    return result(
      entry,
      "right_plan",
      "Spending looks reasonable",
      0,
      `Under $200/mo on OpenAI API — Credex credits become cost-effective above that threshold.`
    );
  }

  return result(entry, "right_plan", "No spend entered", 0, "Enter your monthly API spend to get a recommendation.");
}

// ---------------------------------------------------------------------------
// Gemini
// ---------------------------------------------------------------------------

function auditGemini(entry: ToolEntry, ctx: RuleContext): ToolAuditResult {
  const { seats, planId, monthlySpend } = entry;

  // Ultra is extremely expensive — only justified for very specific use cases
  if (planId === "ultra") {
    const proCost = seats * 19.99;
    const savings = monthlySpend - proCost;
    if (savings > 50) {
      return result(
        entry,
        "downgrade_plan",
        `Downgrade to Gemini Pro ($19.99/seat) — save $${Math.round(savings)}/mo`,
        savings,
        `Gemini Ultra ($249.99/seat) is rarely justified for team use. Pro ($19.99/seat) covers most use cases.`
      );
    }
  }

  // For coding use cases, Windsurf is better value
  if (planId === "pro" && ctx.useCase === "coding") {
    const windsurfCost = seats * 15;
    const savings = monthlySpend - windsurfCost;
    if (savings > 10) {
      return result(
        entry,
        "switch_tool",
        `Switch to Windsurf Pro ($15/seat) for coding`,
        savings,
        `Gemini Pro is a general assistant. For coding, Windsurf Pro ($15/seat) is purpose-built and cheaper.`
      );
    }
  }

  // API: flag for Credex
  if (planId === "api" && monthlySpend >= 200) {
    const savings = monthlySpend * 0.15;
    return result(
      entry,
      "credex_credits",
      "Use Credex credits — save ~15% on Gemini API",
      savings,
      `At $${monthlySpend}/mo on Gemini API, Credex credits can reduce your cost by ~15%.`
    );
  }

  return result(entry, "right_plan", "Optimal plan", 0, "Gemini spend looks reasonable for your use case.");
}

// ---------------------------------------------------------------------------
// Windsurf
// ---------------------------------------------------------------------------

function auditWindsurf(entry: ToolEntry, ctx: RuleContext): ToolAuditResult {
  const { seats, planId, monthlySpend } = entry;

  // Teams plan for small teams: Pro is sufficient under 5 seats
  if (planId === "teams" && seats < 5) {
    const savings = monthlySpend - seats * 15;
    return result(
      entry,
      "downgrade_plan",
      `Downgrade to Windsurf Pro ($15/seat) — save $${Math.round(savings)}/mo`,
      savings,
      `Teams plan ($35/seat) adds admin controls — not needed for ${seats} people. Pro ($15/seat) has the same AI features.`
    );
  }

  // Non-coding use case: Windsurf is coding-only
  if (
    ctx.useCase === "writing" ||
    ctx.useCase === "research" ||
    ctx.useCase === "data"
  ) {
    return result(
      entry,
      "switch_tool",
      "Consider Claude Pro ($20/seat) for non-coding work",
      0,
      `Windsurf is optimised for coding. For ${ctx.useCase} tasks, Claude Pro ($20/seat) offers better value.`
    );
  }

  const expected = expectedMonthlyCost(entry.toolId, planId, seats);
  if (expected !== null && monthlySpend > expected * 1.05) {
    return result(
      entry,
      "downgrade_plan",
      `Verify billing — expected $${expected}/mo`,
      monthlySpend - expected,
      `You're paying $${monthlySpend}/mo but ${planId} for ${seats} seats should be $${expected}/mo.`
    );
  }

  return result(entry, "right_plan", "Optimal plan", 0, "Windsurf spend looks right for your team size.");
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

/**
 * Run the audit rule for a single tool entry.
 * This is the only public export — the engine calls this per tool.
 */
export function auditTool(entry: ToolEntry, ctx: RuleContext): ToolAuditResult {
  switch (entry.toolId) {
    case "cursor":         return auditCursor(entry, ctx);
    case "github_copilot": return auditGithubCopilot(entry, ctx);
    case "claude":         return auditClaude(entry, ctx);
    case "chatgpt":        return auditChatGPT(entry, ctx);
    case "anthropic_api":  return auditAnthropicApi(entry, ctx);
    case "openai_api":     return auditOpenAIApi(entry, ctx);
    case "gemini":         return auditGemini(entry, ctx);
    case "windsurf":       return auditWindsurf(entry, ctx);
  }
}
