"use client";

import { useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Shown when savings < $100/mo — honest "you're spending well" message
 * with an optional notify-me signup for when Credex adds more tools.
 */
export function NotifyMeForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Notify-me submissions are stored via the leads API (Commit 7)
    // For now, simulate a short delay and show success
    await new Promise((r) => setTimeout(r, 600));
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="p-5 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" aria-hidden="true" />
          <p className="text-sm text-emerald-800">
            Got it — we&apos;ll let you know when we add more tools or find new
            savings opportunities for your stack.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <Bell className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Get notified when we find savings
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              We&apos;ll alert you if pricing changes or new alternatives emerge
              for your tools.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            aria-label="Email address for notifications"
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? "…" : "Notify me"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
