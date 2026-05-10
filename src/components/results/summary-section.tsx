import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { generateSummary } from "@/lib/ai/summary";
import type { AuditResult } from "@/types/audit";

interface SummarySectionProps {
  audit: AuditResult;
}

/**
 * Server Component that calls the Anthropic API and renders the summary.
 * Wrapped in Suspense by the parent — streams in after the rest of the page.
 *
 * Falls back to a templated summary on any API failure (handled inside
 * generateSummary — this component always receives a string).
 */
export async function SummarySection({ audit }: SummarySectionProps) {
  const summary = await generateSummary(audit);

  return (
    <Card className="border-border bg-muted/30">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5"
            aria-hidden="true"
          >
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              AI summary
            </p>
            <p className="text-sm text-foreground leading-relaxed">{summary}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton shown while the summary is streaming in via Suspense.
 */
export function SummarySkeleton() {
  return (
    <Card className="border-border bg-muted/30">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5"
            aria-hidden="true"
          >
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <div className="flex-1 space-y-2 pt-1" aria-label="Loading summary" aria-busy="true">
            <div className="h-3 w-16 rounded bg-muted animate-pulse" />
            <div className="h-3 w-full rounded bg-muted animate-pulse" />
            <div className="h-3 w-full rounded bg-muted animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
