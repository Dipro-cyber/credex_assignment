/**
 * /share/[id] — Public shareable audit page.
 *
 * - Fetches audit from Supabase by UUID
 * - Strips all PII — shows only tool data and savings numbers
 * - Full Open Graph + Twitter card meta tags
 * - Screenshot-worthy design for the viral loop
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingDown, CheckCircle2 } from "lucide-react";
import { getAuditById } from "@/lib/supabase";
import { TOOL_CONFIG_MAP } from "@/lib/tools-config";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GITHUB_URL } from "@/lib/constants";
import type { ToolAuditResult, AuditFormState } from "@/types/audit";

// ---------------------------------------------------------------------------
// generateMetadata — params is a Promise in Next.js 16
// ---------------------------------------------------------------------------

export async function generateMetadata(
  props: PageProps<"/share/[id]">
): Promise<Metadata> {
  const { id } = await props.params;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://credexassignment-six.vercel.app";

  const audit = await getAuditById(id);

  if (!audit) {
    return {
      title: "SpendLens — Shared Audit Results",
      description: "See how much this team could save on AI tools.",
    };
  }

  const savings = audit.total_monthly_savings;
  const title =
    savings > 0
      ? `This team could save $${savings.toLocaleString()}/mo on AI tools`
      : "This team's AI spend is already optimised";

  const description =
    savings > 0
      ? `$${savings.toLocaleString()}/mo ($${audit.total_annual_savings.toLocaleString()}/yr) in potential savings found by the AI Spend Audit tool.`
      : "No significant overspend found — this team is running a tight AI stack.";

  const ogImageUrl = `${appUrl}/share/${id}/opengraph-image`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${appUrl}/share/${id}`,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function SharePage(props: PageProps<"/share/[id]">) {
  const { id } = await props.params;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://credexassignment-six.vercel.app";

  const audit = await getAuditById(id);

  if (!audit) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <p className="text-sm text-muted-foreground">
          This audit link has expired or doesn&apos;t exist.
        </p>
        <Link
          href="/audit"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Run your own audit
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </main>
    );
  }

  const toolResults = audit.tool_results as ToolAuditResult[];
  const formState = audit.form_state as AuditFormState;
  const savings = audit.total_monthly_savings;
  const annualSavings = audit.total_annual_savings;

  const sortedResults = [...toolResults].sort(
    (a, b) => b.monthlySavings - a.monthlySavings
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <span className="text-sm font-semibold">SpendLens</span>
          <Link
            href="/audit"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Audit my spend
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-8">
        {/* Shared badge */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Shared audit</Badge>
          <span className="text-xs text-muted-foreground">
            Team of {formState.teamSize} · {formState.useCase} use case
          </span>
        </div>

        {/* Hero savings */}
        <section aria-labelledby="share-savings-heading">
          <div
            className={`rounded-2xl border p-8 text-center ${
              savings > 0
                ? "border-amber-200 bg-gradient-to-b from-amber-50 to-orange-50"
                : "border-emerald-200 bg-emerald-50"
            }`}
          >
            {savings > 0 ? (
              <>
                <div className="flex justify-center mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                    <TrendingDown className="h-7 w-7 text-amber-600" aria-hidden="true" />
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  This team could save
                </p>
                <h1
                  id="share-savings-heading"
                  className="text-6xl font-bold tracking-tight text-amber-700"
                >
                  ${savings.toLocaleString()}
                  <span className="text-2xl font-medium text-muted-foreground">/mo</span>
                </h1>
                <p className="mt-2 text-lg font-semibold text-muted-foreground">
                  ${annualSavings.toLocaleString()} per year
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600" aria-hidden="true" />
                  </div>
                </div>
                <h1
                  id="share-savings-heading"
                  className="text-2xl font-bold text-emerald-900"
                >
                  Spending well
                </h1>
                <p className="mt-2 text-emerald-700">
                  No significant overspend found for this team.
                </p>
              </>
            )}
          </div>
        </section>

        {/* Per-tool breakdown — PII stripped, tools + savings only */}
        <section aria-labelledby="share-breakdown-heading">
          <h2
            id="share-breakdown-heading"
            className="text-base font-semibold text-foreground mb-3"
          >
            Tool breakdown
          </h2>
          <div className="space-y-3" role="list">
            {sortedResults.map((r) => {
              const config = TOOL_CONFIG_MAP[r.toolId];
              const planLabel =
                config?.plans.find((p) => p.id === r.planId)?.label ?? r.planId;

              return (
                <Card key={r.toolId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-foreground">
                            {config?.label ?? r.toolId}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {planLabel}
                            {r.seats > 1 ? ` · ${r.seats} seats` : ""}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {r.reason}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        {r.monthlySavings > 0 ? (
                          <p className="text-sm font-bold text-emerald-600">
                            −${r.monthlySavings.toLocaleString()}/mo
                          </p>
                        ) : (
                          <p className="text-sm font-medium text-emerald-600">✓</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
          <p className="font-semibold text-foreground mb-2">
            Want to audit your own AI spend?
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Free, takes 2 minutes, no login required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Run my audit
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View on GitHub →
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Shared via{" "}
          <a
            href={`${appUrl}/share/${id}`}
            className="underline underline-offset-4 hover:text-foreground"
          >
            SpendLens
          </a>{" "}
          · Pricing data from official vendor pages
        </p>
      </main>
    </div>
  );
}
