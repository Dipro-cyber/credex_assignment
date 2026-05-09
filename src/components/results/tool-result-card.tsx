import {
  CheckCircle2,
  ArrowDownCircle,
  ArrowRightCircle,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TOOL_CONFIG_MAP } from "@/lib/tools-config";
import type { ToolAuditResult, RecommendationType } from "@/types/audit";

interface ToolResultCardProps {
  result: ToolAuditResult;
}

const TYPE_META: Record<
  RecommendationType,
  { label: string; badgeVariant: "success" | "default" | "secondary" | "outline"; icon: React.ElementType }
> = {
  right_plan:     { label: "Optimal",       badgeVariant: "success",   icon: CheckCircle2 },
  downgrade_plan: { label: "Downgrade",     badgeVariant: "default",   icon: ArrowDownCircle },
  switch_tool:    { label: "Switch tool",   badgeVariant: "default",   icon: ArrowRightCircle },
  credex_credits: { label: "Credex saves",  badgeVariant: "secondary", icon: Sparkles },
  overpaying_api: { label: "Overpaying",    badgeVariant: "default",   icon: AlertCircle },
};

export function ToolResultCard({ result }: ToolResultCardProps) {
  const config = TOOL_CONFIG_MAP[result.toolId];
  const meta = TYPE_META[result.recommendationType];
  const Icon = meta.icon;

  const planLabel =
    config.plans.find((p) => p.id === result.planId)?.label ?? result.planId;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              result.monthlySavings > 0
                ? "bg-amber-100"
                : "bg-emerald-100"
            }`}
            aria-hidden="true"
          >
            <Icon
              className={`h-5 w-5 ${
                result.monthlySavings > 0
                  ? "text-amber-600"
                  : "text-emerald-600"
              }`}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-foreground">
                {config.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {planLabel}
                {result.seats > 1 ? ` · ${result.seats} seats` : ""}
              </span>
              <Badge variant={meta.badgeVariant} className="text-xs">
                {meta.label}
              </Badge>
            </div>

            {/* Current spend */}
            <p className="text-xs text-muted-foreground mb-2">
              Current spend:{" "}
              <span className="font-medium text-foreground">
                ${result.currentMonthlySpend.toLocaleString()}/mo
              </span>
            </p>

            {/* Recommendation */}
            {result.recommendationType !== "right_plan" && (
              <p className="text-sm font-medium text-foreground mb-1">
                → {result.recommendedAction}
              </p>
            )}

            {/* Reason */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              {result.reason}
            </p>
          </div>

          {/* Savings badge */}
          <div className="shrink-0 text-right">
            {result.monthlySavings > 0 ? (
              <div>
                <p className="text-base font-bold text-emerald-600">
                  −${result.monthlySavings.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">/mo</p>
              </div>
            ) : (
              <p className="text-sm font-medium text-emerald-600">✓</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
