"use client";

import { useState } from "react";
import { Mail, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface EmailCaptureFormProps {
  auditId: string;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  topRecommendations: string[];
}

/**
 * Email capture shown AFTER results are displayed — never before.
 * Optional fields: company name, role.
 * Submits to /api/leads (Commit 7).
 */
export function EmailCaptureForm({ auditId, totalMonthlySavings, totalAnnualSavings, topRecommendations }: EmailCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Honeypot field — bots fill this, humans don't
  const [honeypot, setHoneypot] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Honeypot check — if filled, silently succeed without storing
    if (honeypot) {
      setSubmitted(true);
      return;
    }

    if (!email.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId,
          email: email.trim(),
          companyName: company.trim() || undefined,
          role: role.trim() || undefined,
          totalMonthlySavings,
          totalAnnualSavings,
          topRecommendations,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Something went wrong");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="p-6 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-medium text-emerald-900">Report sent!</p>
            <p className="text-sm text-emerald-700 mt-0.5">
              Check your inbox for a copy of your audit results.
              {totalMonthlySavings >= 500 &&
                " A Credex team member will reach out within 24 hours."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <CardTitle className="text-base">Get your report by email</CardTitle>
        </div>
        <CardDescription>
          We&apos;ll send you a copy of this audit. No spam — one email, that&apos;s it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          {/* Honeypot — visually hidden, not accessible to screen readers */}
          <div
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}
          >
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {/* Email — required */}
            <div>
              <label htmlFor="capture-email" className="sr-only">
                Email address
              </label>
              <input
                id="capture-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Optional fields toggle */}
            <button
              type="button"
              onClick={() => setShowOptional((v) => !v)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-expanded={showOptional}
            >
              {showOptional ? (
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {showOptional ? "Hide" : "Add"} company &amp; role (optional)
            </button>

            {showOptional && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="capture-company" className="sr-only">
                    Company name
                  </label>
                  <input
                    id="capture-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company name"
                    autoComplete="organization"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label htmlFor="capture-role" className="sr-only">
                    Your role
                  </label>
                  <input
                    id="capture-role"
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Your role (e.g. CTO)"
                    autoComplete="organization-title"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            )}

            {error && (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
              aria-busy={loading}
            >
              {loading ? "Sending…" : "Send my report"}
            </button>

            <p className="text-xs text-center text-muted-foreground">
              No spam. Unsubscribe any time.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
