import { TrendingDown, TrendingUp } from "lucide-react";
import {
  HIGH_SAVINGS_THRESHOLD_MONTHLY,
  LOW_SAVINGS_THRESHOLD_MONTHLY,
} from "@/lib/constants";

interface HeroSavingsProps {
  totalMonthlySavings: number;
  totalAnnualSavings: number;
}

export function HeroSavings({
  totalMonthlySavings,
  totalAnnualSavings,
}: HeroSavingsProps) {
  const isHighSavings = totalMonthlySavings >= HIGH_SAVINGS_THRESHOLD_MONTHLY;
  const isLowSavings = totalMonthlySavings < LOW_SAVINGS_THRESHOLD_MONTHLY;

  if (isLowSavings) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <TrendingUp
              className="h-7 w-7 text-emerald-600"
              aria-hidden="true"
            />
          </div>
        </div>
        <h2 className="text-xl font-bold text-emerald-900 mb-2">
          You&apos;re spending well
        </h2>
        <p className="text-emerald-700 text-sm max-w-md mx-auto">
          Your AI spend looks optimised for your team size and use case. We
          found less than ${LOW_SAVINGS_THRESHOLD_MONTHLY}/mo in potential
          savings — not worth switching for.
        </p>
        {totalMonthlySavings > 0 && (
          <p className="mt-4 text-xs text-emerald-600">
            Minor optimisation possible: ${totalMonthlySavings}/mo (${totalAnnualSavings}/yr)
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-8 text-center ${
        isHighSavings
          ? "border-amber-200 bg-gradient-to-b from-amber-50 to-orange-50"
          : "border-border bg-card"
      }`}
    >
      <div className="flex justify-center mb-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full ${
            isHighSavings ? "bg-amber-100" : "bg-muted"
          }`}
        >
          <TrendingDown
            className={`h-7 w-7 ${
              isHighSavings ? "text-amber-600" : "text-foreground"
            }`}
            aria-hidden="true"
          />
        </div>
      </div>

      <p className="text-sm font-medium text-muted-foreground mb-1">
        You could save
      </p>

      <p
        className={`text-6xl font-bold tracking-tight ${
          isHighSavings ? "text-amber-700" : "text-foreground"
        }`}
        aria-label={`$${totalMonthlySavings.toLocaleString()} per month`}
      >
        ${totalMonthlySavings.toLocaleString()}
        <span className="text-2xl font-medium text-muted-foreground">/mo</span>
      </p>

      <p className="mt-2 text-lg font-semibold text-muted-foreground">
        ${totalAnnualSavings.toLocaleString()} per year
      </p>
    </div>
  );
}
