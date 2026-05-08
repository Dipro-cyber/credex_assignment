import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SpendInputForm } from "@/components/forms/spend-input-form";

export const metadata: Metadata = {
  title: "Audit Your AI Spend — AI Spend Audit",
  description:
    "Enter your AI tools, plans, and monthly spend to get an instant savings breakdown.",
};

/**
 * /audit — Spend input form page.
 *
 * This is a Server Component page that renders the Client Component form.
 * Form state is persisted to localStorage so it survives page reloads.
 */
export default function AuditPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          <span className="text-sm font-semibold">AI Spend Audit</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            What are you paying for?
          </h1>
          <p className="mt-2 text-muted-foreground">
            Add each AI tool your team uses. We&apos;ll show you exactly where
            you&apos;re overspending and what to do about it.
          </p>
        </div>

        {/* Progress hint */}
        <ol
          aria-label="Audit steps"
          className="flex items-center gap-2 mb-8 text-xs text-muted-foreground"
        >
          <li className="flex items-center gap-1.5 font-medium text-foreground">
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold"
              aria-hidden="true"
            >
              1
            </span>
            Enter tools
          </li>
          <li aria-hidden="true" className="flex-1 h-px bg-border" />
          <li className="flex items-center gap-1.5">
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-xs"
              aria-hidden="true"
            >
              2
            </span>
            See savings
          </li>
          <li aria-hidden="true" className="flex-1 h-px bg-border" />
          <li className="flex items-center gap-1.5">
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-xs"
              aria-hidden="true"
            >
              3
            </span>
            Get your report
          </li>
        </ol>

        {/* The form — Client Component */}
        <SpendInputForm />
      </main>
    </div>
  );
}
