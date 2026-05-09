import { ArrowRight, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CREDEX_URL } from "@/lib/constants";

interface CredexCtaProps {
  totalMonthlySavings: number;
}

/**
 * Shown prominently when savings > $500/mo.
 * Links to Credex consultation booking.
 */
export function CredexCta({ totalMonthlySavings }: CredexCtaProps) {
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
              Save ${totalMonthlySavings.toLocaleString()}/mo with Credex
            </h3>
            <p className="text-sm text-amber-800 mb-4 leading-relaxed">
              Your team is spending enough on AI that Credex infrastructure
              credits could cut your bill significantly. We negotiate bulk
              rates with Anthropic, OpenAI, and Google — and pass the savings
              directly to you.
            </p>
            <a
              href={`${CREDEX_URL}?utm_source=spend-audit&utm_medium=cta&utm_campaign=high-savings`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
            >
              Book a free consultation
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <p className="mt-3 text-xs text-amber-700">
              Free 30-min call · No commitment · Credex team will reach out
              within 24 hours
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
