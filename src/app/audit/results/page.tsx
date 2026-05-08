/**
 * /audit/results — Audit results page.
 *
 * Reads form state from the `data` search param (encoded JSON),
 * runs the audit engine, and renders the results.
 *
 * Full results UI is built in Commit 5. This commit wires up the engine
 * and shows a raw JSON preview to confirm the engine is working.
 */
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { runAudit } from "@/lib/audit/engine";
import type { AuditFormState } from "@/types/audit";

// This page is dynamically rendered because it reads searchParams
export const dynamic = "force-dynamic";

export default async function ResultsPage(props: PageProps<"/audit/results">) {
  const searchParams = await props.searchParams;
  const raw = searchParams?.data;

  // Parse and validate the form state from the URL
  let formState: AuditFormState | null = null;
  let parseError: string | null = null;

  if (typeof raw === "string") {
    try {
      formState = JSON.parse(decodeURIComponent(raw)) as AuditFormState;
    } catch {
      parseError = "Could not parse audit data from URL.";
    }
  } else {
    parseError = "No audit data found. Please go back and fill in the form.";
  }

  if (parseError || !formState) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <p className="text-sm text-muted-foreground">{parseError}</p>
        <Link
          href="/audit"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to form
        </Link>
      </main>
    );
  }

  // Run the audit engine (pure function — no I/O)
  const auditResult = runAudit(formState);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4 sm:px-6">
          <Link
            href="/audit"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          <span className="text-sm font-semibold">Your Audit Results</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        {/* Hero savings — full UI in Commit 5 */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">Total monthly savings</p>
          <p className="text-5xl font-bold text-foreground">
            ${auditResult.totalMonthlySavings.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            ${auditResult.totalAnnualSavings.toLocaleString()} / year
          </p>
        </div>

        {/* Per-tool results — full UI in Commit 5 */}
        <div className="space-y-3">
          {auditResult.toolResults.map((r) => (
            <div
              key={r.toolId}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-sm text-foreground capitalize">
                    {r.toolId.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.reason}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-foreground">
                    {r.monthlySavings > 0
                      ? `−$${r.monthlySavings}/mo`
                      : "✓ Optimal"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.recommendedAction}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Full results UI with Credex CTA and email capture coming in Commit 5.
        </p>
      </main>
    </div>
  );
}
