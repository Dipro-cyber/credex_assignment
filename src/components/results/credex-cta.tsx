import { ArrowRight, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SavingsCtaProps {
  totalMonthlySavings: number;
}

/**
 * Shown prominently when savings > $500/mo.
 * High-savings teams are prompted to explore bulk API credits.
 */
export function CredexCta({ totalMonthlySavings }: SavingsCtaProps) {
  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100"
            aria-hidden="true"
          >
            <Zap className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900 mb-1">
              ${totalMonthlySavings.toLocaleString()}/mo in savings identified
            </h3>
            <p className="text-sm text-amber-800 mb-4 leading-relaxed">
              Your team is spending enough on AI tools that switching plans and
              negotiating bulk API credits could significantly cut your bill.
              Act on the recommendations below to start saving today.
            </p>
            <a
              href="/audit"
              className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
            >
              Share this audit with your team
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <p className="mt-3 text-xs text-amber-700">
              Share the link with your CTO or CFO — no login required to view.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
