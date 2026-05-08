"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowRight, RotateCcw, Info } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { TOOL_CONFIGS, TOOL_CONFIG_MAP, USE_CASE_OPTIONS } from "@/lib/tools-config";
import { FORM_STORAGE_KEY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { AuditFormState, ToolEntry, ToolId, PlanId, UseCase } from "@/types/audit";

// ---------------------------------------------------------------------------
// Default form state
// ---------------------------------------------------------------------------

const DEFAULT_FORM_STATE: AuditFormState = {
  tools: [],
  teamSize: 5,
  useCase: "mixed",
};

// ---------------------------------------------------------------------------
// Main form component
// ---------------------------------------------------------------------------

export function SpendInputForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formState, setFormState, clearFormState] = useLocalStorage<AuditFormState>(
    FORM_STORAGE_KEY,
    DEFAULT_FORM_STATE
  );

  // Which tool is being added (from the tool picker)
  const [addingToolId, setAddingToolId] = useState<ToolId | null>(null);

  // Validation error message
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const addedToolIds = new Set(formState.tools.map((t) => t.toolId));

  function addTool(toolId: ToolId) {
    const config = TOOL_CONFIG_MAP[toolId];
    const newEntry: ToolEntry = {
      toolId,
      planId: config.defaultPlan,
      monthlySpend: 0,
      seats: 1,
    };
    setFormState((prev) => ({ ...prev, tools: [...prev.tools, newEntry] }));
    setAddingToolId(null);
    setError(null);
  }

  function removeTool(toolId: ToolId) {
    setFormState((prev) => ({
      ...prev,
      tools: prev.tools.filter((t) => t.toolId !== toolId),
    }));
  }

  function updateTool(toolId: ToolId, patch: Partial<ToolEntry>) {
    setFormState((prev) => ({
      ...prev,
      tools: prev.tools.map((t) =>
        t.toolId === toolId ? { ...t, ...patch } : t
      ),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (formState.tools.length === 0) {
      setError("Add at least one AI tool to audit.");
      return;
    }

    const hasSpend = formState.tools.some((t) => t.monthlySpend > 0);
    if (!hasSpend) {
      setError("Enter a monthly spend amount for at least one tool.");
      return;
    }

    // Encode form state into URL search params and navigate to results
    // The audit engine runs on the results page (Commit 4/5)
    startTransition(() => {
      const encoded = encodeURIComponent(JSON.stringify(formState));
      router.push(`/audit/results?data=${encoded}`);
    });
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="AI spend audit form">
      {/* ------------------------------------------------------------------ */}
      {/* Step 1 — Team context                                               */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="team-context-heading">
        <Card>
          <CardHeader>
            <CardTitle id="team-context-heading" className="text-base">
              Your team
            </CardTitle>
            <CardDescription>
              Helps us flag plans that don&apos;t fit your team size.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Team size */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="team-size"
                className="text-sm font-medium text-foreground"
              >
                Team size
              </label>
              <input
                id="team-size"
                type="number"
                min={1}
                max={10000}
                value={formState.teamSize}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    teamSize: Math.max(1, parseInt(e.target.value) || 1),
                  }))
                }
                className={inputClass}
                aria-describedby="team-size-hint"
              />
              <p id="team-size-hint" className="text-xs text-muted-foreground">
                Total people who use AI tools
              </p>
            </div>

            {/* Primary use case */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="use-case"
                className="text-sm font-medium text-foreground"
              >
                Primary use case
              </label>
              <select
                id="use-case"
                value={formState.useCase}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    useCase: e.target.value as UseCase,
                  }))
                }
                className={inputClass}
              >
                {USE_CASE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Step 2 — Tool entries                                               */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="tools-heading" className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 id="tools-heading" className="text-sm font-semibold text-foreground">
            Your AI tools
            {formState.tools.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {formState.tools.length}
              </Badge>
            )}
          </h2>
          {formState.tools.length > 0 && (
            <button
              type="button"
              onClick={clearFormState}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear all tools"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Clear all
            </button>
          )}
        </div>

        <div className="space-y-3">
          {formState.tools.map((entry) => (
            <ToolRow
              key={entry.toolId}
              entry={entry}
              onUpdate={(patch) => updateTool(entry.toolId, patch)}
              onRemove={() => removeTool(entry.toolId)}
            />
          ))}
        </div>

        {/* Empty state */}
        {formState.tools.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No tools added yet. Pick one below.
            </p>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Tool picker                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="add-tool-heading" className="mt-4">
        <h3 id="add-tool-heading" className="sr-only">
          Add a tool
        </h3>

        {addingToolId === null ? (
          <button
            type="button"
            onClick={() => setAddingToolId("cursor")}
            className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
            aria-label="Add an AI tool"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add a tool
          </button>
        ) : (
          <ToolPicker
            addedToolIds={addedToolIds}
            onSelect={addTool}
            onCancel={() => setAddingToolId(null)}
          />
        )}
      </section>

      <Separator className="my-8" />

      {/* ------------------------------------------------------------------ */}
      {/* Validation error                                                     */}
      {/* ------------------------------------------------------------------ */}
      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <Info className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Submit                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          Results are instant. Email captured after — never before.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors",
            isPending
              ? "opacity-60 cursor-not-allowed"
              : "hover:bg-primary/90"
          )}
          aria-busy={isPending}
        >
          {isPending ? "Running audit…" : "Run my audit"}
          {!isPending && (
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// ToolRow — one row per added tool
// ---------------------------------------------------------------------------

interface ToolRowProps {
  entry: ToolEntry;
  onUpdate: (patch: Partial<ToolEntry>) => void;
  onRemove: () => void;
}

function ToolRow({ entry, onUpdate, onRemove }: ToolRowProps) {
  const config = TOOL_CONFIG_MAP[entry.toolId];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="font-medium text-sm text-foreground">{config.label}</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
            aria-label={`Remove ${config.label}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Plan selector */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`plan-${entry.toolId}`}
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Plan
            </label>
            <select
              id={`plan-${entry.toolId}`}
              value={entry.planId}
              onChange={(e) => onUpdate({ planId: e.target.value as PlanId })}
              className={inputClass}
            >
              {config.plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.label}
                  {plan.hint ? ` — ${plan.hint}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Monthly spend */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`spend-${entry.toolId}`}
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Monthly spend (USD)
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"
                aria-hidden="true"
              >
                $
              </span>
              <input
                id={`spend-${entry.toolId}`}
                type="number"
                min={0}
                step={1}
                value={entry.monthlySpend === 0 ? "" : entry.monthlySpend}
                placeholder="0"
                onChange={(e) =>
                  onUpdate({
                    monthlySpend: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className={cn(inputClass, "pl-7")}
                aria-label={`Monthly spend for ${config.label} in USD`}
              />
            </div>
          </div>

          {/* Seats — only for seat-based tools */}
          {config.seatBased ? (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={`seats-${entry.toolId}`}
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                Seats
              </label>
              <input
                id={`seats-${entry.toolId}`}
                type="number"
                min={1}
                max={10000}
                value={entry.seats}
                onChange={(e) =>
                  onUpdate({
                    seats: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className={inputClass}
                aria-label={`Number of seats for ${config.label}`}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Seats
              </p>
              <p className="text-sm text-muted-foreground pt-2">
                Usage-based
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// ToolPicker — grid of available tools to add
// ---------------------------------------------------------------------------

interface ToolPickerProps {
  addedToolIds: Set<ToolId>;
  onSelect: (toolId: ToolId) => void;
  onCancel: () => void;
}

function ToolPicker({ addedToolIds, onSelect, onCancel }: ToolPickerProps) {
  const available = TOOL_CONFIGS.filter((t) => !addedToolIds.has(t.id));

  if (available.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        All supported tools have been added.{" "}
        <button
          type="button"
          onClick={onCancel}
          className="underline underline-offset-4 hover:text-foreground"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-border bg-card p-4"
      role="listbox"
      aria-label="Select a tool to add"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-foreground">Select a tool</p>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cancel adding tool"
        >
          Cancel
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {available.map((tool) => (
          <button
            key={tool.id}
            type="button"
            role="option"
            aria-selected={false}
            onClick={() => onSelect(tool.id)}
            className="flex flex-col items-start gap-0.5 rounded-lg border border-border bg-background px-3 py-2.5 text-left hover:border-foreground hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm font-medium text-foreground">
              {tool.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {tool.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared input class
// ---------------------------------------------------------------------------

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors";
