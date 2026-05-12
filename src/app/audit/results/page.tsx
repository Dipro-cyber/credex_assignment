/**
 * /audit/results — Full audit results page.
 *
 * Server Component: reads searchParams, runs audit engine, renders results.
 * Client Components are used only for interactive elements (share, email form).
 * The AI summary streams in via Suspense — it never blocks the rest of the page.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { runAudit } from "@/lib/audit/engine";
import { HeroSavings } from "@/components/results/hero-savings";
import { ToolResultCard } from "@/components/results/tool-result-card";
import { CredexCta } from "@/components/results/credex-cta";
import { NotifyMeForm } from "@/components/results/notify-me-form";
import { EmailCaptureForm } from "@/components/results/email-capture-form";
import { ShareButton } from "@/components/results/share-button";import { SummarySection, SummarySkeleton } from "@/components/results/summary-section";
import { Separator } from "@/components/ui/separator";
import {
  HIGH_SAVINGS_THRESHOLD_MONTHLY,
  LOW_SAVINGS_THRESHOLD_MONTHLY,
} from "@/lib/constants";
import type { AuditFormState } from "@/types/audit";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your AI Spend Audit Results",
  description: "See where you're overspending on AI tools and how much you could save.",
};

export default async function ResultsPage(props: PageProps<"/audit/results">) {
  const searchParams = await props.searchParams;
  const raw = searchParams?.data;

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

  const audit = runAudit(formState);

  const isHighSavings = audit.totalMonthlySavings >= HIGH_SAVINGS_THRESHOLD_MONTHLY;
  const isLowSavings = audit.totalMonthlySavings < LOW_SAVINGS_THRESHOLD_MONTHLY;

  // Sort: highest savings first, then optimal
  const sortedResults = [...audit.toolResults].sort(
    (a, b) => b.monthlySavings - a.monthlySavings
  );

  return (
    <div className="min-h-screen bg-background">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <nav aria-label="Breadcrumb">
              <Link
                href="/audit"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Back to form"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </Link>
            </nav>
            <span className="text-sm font-semibold" aria-hidden="true">Audit Results</span>
          </div>
          <ShareButton audit={audit} />
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-8">
        {/* ---------------------------------------------------------------- */}
        {/* Hero savings number                                               */}
        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="savings-heading">
          <h1 id="savings-heading" className="sr-only">
            Your AI spend audit results
          </h1>
          <HeroSavings
            totalMonthlySavings={audit.totalMonthlySavings}
            totalAnnualSavings={audit.totalAnnualSavings}
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* AI-generated personalized summary — streams in via Suspense      */}
        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="sr-only">
            Personalized summary
          </h2>
          <Suspense fallback={<SummarySkeleton />}>
            <SummarySection audit={audit} />
          </Suspense>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Credex CTA — only for high savings                               */}
        {/* ---------------------------------------------------------------- */}
        {isHighSavings && (
          <section aria-labelledby="credex-cta-heading">
            <h2 id="credex-cta-heading" className="sr-only">
              Save more with Credex
            </h2>
            <CredexCta totalMonthlySavings={audit.totalMonthlySavings} />
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Per-tool breakdown                                                */}
        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="breakdown-heading">
          <h2
            id="breakdown-heading"
            className="text-base font-semibold text-foreground mb-3"
          >
            Per-tool breakdown
          </h2>
          <div className="space-y-3" role="list" aria-label="Tool audit results">
            {sortedResults.map((r) => (
              <div key={r.toolId} role="listitem">
                <ToolResultCard result={r} />
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Savings summary row                                               */}
        {/* ---------------------------------------------------------------- */}
        {audit.totalMonthlySavings > 0 && (
          <div className="rounded-xl border border-border bg-muted/40 px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total monthly savings</p>
              <p className="text-xl font-bold text-foreground">
                ${audit.totalMonthlySavings.toLocaleString()}/mo
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Annual savings</p>
              <p className="text-xl font-bold text-emerald-600">
                ${audit.totalAnnualSavings.toLocaleString()}/yr
              </p>
            </div>
          </div>
        )}

        <Separator />

        {/* ---------------------------------------------------------------- */}
        {/* Email capture — shown AFTER results, never before                */}
        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="email-capture-heading">
          <h2
            id="email-capture-heading"
            className="text-base font-semibold text-foreground mb-3"
          >
            Get your report
          </h2>
          <EmailCaptureForm
            auditId={audit.id}
            totalMonthlySavings={audit.totalMonthlySavings}
            totalAnnualSavings={audit.totalAnnualSavings}
            topRecommendations={sortedResults
              .filter((r) => r.monthlySavings > 0)
              .slice(0, 3)
              .map((r) => r.recommendedAction)}
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Notify me — only for low savings                                 */}
        {/* ---------------------------------------------------------------- */}
        {isLowSavings && (
          <section aria-labelledby="notify-heading">
            <h2 id="notify-heading" className="sr-only">
              Get notified about future savings
            </h2>
            <NotifyMeForm />
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Footer actions                                                    */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Run a new audit
          </Link>
          <p className="text-xs text-muted-foreground text-center">
            Pricing data sourced from official vendor pages.{" "}
            <Link href="/" className="underline underline-offset-4 hover:text-foreground">
              About this tool
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
