"use client";

import { useState } from "react";
import { Share2, Check, Loader2 } from "lucide-react";
import type { AuditResult } from "@/types/audit";

interface ShareButtonProps {
  audit: AuditResult;
}

/**
 * Saves the audit to Supabase (via /api/audit) then copies the
 * /share/[id] URL to clipboard.
 *
 * The save is fire-and-forget on first click — if it fails, the URL
 * is still copied but the share page will show a "not found" message.
 */
export function ShareButton({ audit }: ShareButtonProps) {
  const [state, setState] = useState<"idle" | "saving" | "copied" | "error">("idle");

  async function handleShare() {
    if (state === "saving") return;
    setState("saving");

    // Save audit to Supabase for the share page
    try {
      await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: audit.id,
          formState: audit.formState,
          toolResults: audit.toolResults,
          totalMonthlySavings: audit.totalMonthlySavings,
          totalAnnualSavings: audit.totalAnnualSavings,
        }),
      });
    } catch {
      // Non-fatal — still copy the URL
    }

    const url = `${window.location.origin}/share/${audit.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for browsers without clipboard API
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }

    setState("copied");
    setTimeout(() => setState("idle"), 2500);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={state === "saving"}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-60"
      aria-label="Save and copy shareable link to clipboard"
    >
      {state === "saving" && (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      {state === "copied" && (
        <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
      )}
      {(state === "idle" || state === "error") && (
        <Share2 className="h-4 w-4" aria-hidden="true" />
      )}
      {state === "saving" ? "Saving…" : state === "copied" ? "Copied!" : "Share"}
    </button>
  );
}
