/**
 * Core domain types for the AI Spend Audit tool.
 * These types flow from the input form → audit engine → results page → shareable URL.
 */

// ---------------------------------------------------------------------------
// Tool identifiers
// ---------------------------------------------------------------------------

export type ToolId =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

// ---------------------------------------------------------------------------
// Plan identifiers per tool
// ---------------------------------------------------------------------------

export type CursorPlan = "hobby" | "pro" | "business" | "enterprise";
export type GithubCopilotPlan = "individual" | "business" | "enterprise";
export type ClaudePlan = "free" | "pro" | "max" | "team" | "enterprise" | "api";
export type ChatGPTPlan = "plus" | "team" | "enterprise" | "api";
export type AnthropicApiPlan = "api";
export type OpenAIApiPlan = "api";
export type GeminiPlan = "pro" | "ultra" | "api";
export type WindsurfPlan = "free" | "pro" | "teams";

export type PlanId =
  | CursorPlan
  | GithubCopilotPlan
  | ClaudePlan
  | ChatGPTPlan
  | AnthropicApiPlan
  | OpenAIApiPlan
  | GeminiPlan
  | WindsurfPlan;

// ---------------------------------------------------------------------------
// Use case
// ---------------------------------------------------------------------------

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

// ---------------------------------------------------------------------------
// Form state — persisted to localStorage
// ---------------------------------------------------------------------------

export interface ToolEntry {
  toolId: ToolId;
  planId: PlanId;
  /** User-entered monthly spend in USD */
  monthlySpend: number;
  /** Number of seats / licenses */
  seats: number;
}

export interface AuditFormState {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

// ---------------------------------------------------------------------------
// Audit result types — produced by the audit engine
// ---------------------------------------------------------------------------

export type RecommendationType =
  | "right_plan" // Already on the optimal plan
  | "downgrade_plan" // Switch to a cheaper plan from the same vendor
  | "switch_tool" // Switch to a different tool entirely
  | "credex_credits" // Use Credex credits for additional savings
  | "overpaying_api"; // Paying retail API rates when bulk credits would help

export interface ToolAuditResult {
  toolId: ToolId;
  planId: PlanId;
  currentMonthlySpend: number;
  seats: number;
  recommendationType: RecommendationType;
  /** Recommended plan or tool name */
  recommendedAction: string;
  /** Monthly savings in USD (0 if already optimal) */
  monthlySavings: number;
  /** One-sentence human-readable reason */
  reason: string;
}

export interface AuditResult {
  id: string; // UUID — used for shareable URL
  createdAt: string; // ISO 8601
  formState: AuditFormState;
  toolResults: ToolAuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  /** AI-generated personalized summary (may be null if API failed) */
  personalizedSummary: string | null;
}

// ---------------------------------------------------------------------------
// Lead capture
// ---------------------------------------------------------------------------

export interface LeadData {
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  totalMonthlySavings: number;
}
