/**
 * Static configuration for all supported AI tools.
 * Defines display names, available plans, and default values.
 * Pricing numbers live in src/lib/audit/pricing.ts (Commit 4).
 */

import type { ToolId, PlanId, UseCase } from "@/types/audit";

export interface PlanOption {
  id: PlanId;
  label: string;
  /** Hint shown under the plan name, e.g. "min 5 seats" */
  hint?: string;
}

export interface ToolConfig {
  id: ToolId;
  label: string;
  /** Short description shown in the tool selector */
  description: string;
  plans: PlanOption[];
  defaultPlan: PlanId;
  /** Whether this tool is seat-based (true) or usage/flat (false) */
  seatBased: boolean;
}

export const TOOL_CONFIGS: ToolConfig[] = [
  {
    id: "cursor",
    label: "Cursor",
    description: "AI code editor",
    seatBased: true,
    defaultPlan: "pro",
    plans: [
      { id: "hobby", label: "Hobby", hint: "Free tier" },
      { id: "pro", label: "Pro", hint: "$20/seat/mo" },
      { id: "business", label: "Business", hint: "$40/seat/mo" },
      { id: "enterprise", label: "Enterprise", hint: "Custom pricing" },
    ],
  },
  {
    id: "github_copilot",
    label: "GitHub Copilot",
    description: "AI coding assistant",
    seatBased: true,
    defaultPlan: "business",
    plans: [
      { id: "individual", label: "Individual", hint: "$10/seat/mo" },
      { id: "business", label: "Business", hint: "$19/seat/mo" },
      { id: "enterprise", label: "Enterprise", hint: "$39/seat/mo" },
    ],
  },
  {
    id: "claude",
    label: "Claude",
    description: "Anthropic's AI assistant",
    seatBased: true,
    defaultPlan: "pro",
    plans: [
      { id: "free", label: "Free", hint: "$0" },
      { id: "pro", label: "Pro", hint: "$20/seat/mo" },
      { id: "max", label: "Max", hint: "$100/seat/mo" },
      { id: "team", label: "Team", hint: "$30/seat/mo, min 5 seats" },
      { id: "enterprise", label: "Enterprise", hint: "Custom pricing" },
      { id: "api", label: "API direct", hint: "Usage-based" },
    ],
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    description: "OpenAI's AI assistant",
    seatBased: true,
    defaultPlan: "plus",
    plans: [
      { id: "plus", label: "Plus", hint: "$20/seat/mo" },
      { id: "team", label: "Team", hint: "$30/seat/mo, min 2 seats" },
      { id: "enterprise", label: "Enterprise", hint: "Custom pricing" },
      { id: "api", label: "API direct", hint: "Usage-based" },
    ],
  },
  {
    id: "anthropic_api",
    label: "Anthropic API",
    description: "Direct API access",
    seatBased: false,
    defaultPlan: "api",
    plans: [{ id: "api", label: "API (usage-based)", hint: "Pay per token" }],
  },
  {
    id: "openai_api",
    label: "OpenAI API",
    description: "Direct API access",
    seatBased: false,
    defaultPlan: "api",
    plans: [{ id: "api", label: "API (usage-based)", hint: "Pay per token" }],
  },
  {
    id: "gemini",
    label: "Gemini",
    description: "Google's AI assistant",
    seatBased: true,
    defaultPlan: "pro",
    plans: [
      { id: "pro", label: "Pro (AI Premium)", hint: "$19.99/mo" },
      { id: "ultra", label: "Ultra (AI Ultra)", hint: "$249.99/mo" },
      { id: "api", label: "API direct", hint: "Usage-based" },
    ],
  },
  {
    id: "windsurf",
    label: "Windsurf",
    description: "AI code editor by Codeium",
    seatBased: true,
    defaultPlan: "pro",
    plans: [
      { id: "free", label: "Free", hint: "$0" },
      { id: "pro", label: "Pro", hint: "$20/seat/mo" },
      { id: "teams", label: "Teams", hint: "$40/seat/mo" },
    ],
  },
];

export const TOOL_CONFIG_MAP: Record<ToolId, ToolConfig> = Object.fromEntries(
  TOOL_CONFIGS.map((t) => [t.id, t])
) as Record<ToolId, ToolConfig>;

export const USE_CASE_OPTIONS: { id: UseCase; label: string }[] = [
  { id: "coding", label: "Coding / engineering" },
  { id: "writing", label: "Writing / content" },
  { id: "data", label: "Data analysis" },
  { id: "research", label: "Research" },
  { id: "mixed", label: "Mixed / general" },
];
