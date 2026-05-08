import Link from "next/link";
import { ArrowRight, CheckCircle, TrendingDown, Zap, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CREDEX_URL } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Static metadata for this page is set in layout.tsx (root metadata).
// ---------------------------------------------------------------------------

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <SocialProofBar />
        <HowItWorksSection />
        <WhatYouGetSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight">
            AI Spend Audit
          </span>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Free
          </Badge>
        </div>
        <nav className="flex items-center gap-4">
          <a
            href={CREDEX_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            by Credex
          </a>
          <Link
            href="/audit"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Start audit
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-16 text-center"
    >
      <Badge variant="outline" className="mb-6 text-xs">
        Takes 2 minutes · No login required
      </Badge>

      <h1
        id="hero-heading"
        className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight"
      >
        Stop overpaying for
        <br />
        <span className="text-muted-foreground">AI tools</span>
      </h1>

      <p className="mt-6 max-w-xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
        Enter your AI subscriptions and get an instant breakdown of where
        you&apos;re wasting money — with exact numbers.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/audit"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          Audit my AI spend
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <p className="text-sm text-muted-foreground">
          Free · No credit card · Results in seconds
        </p>
      </div>

      {/* Hero visual — savings preview card */}
      <div className="mt-16 mx-auto max-w-lg">
        <SavingsPreviewCard />
      </div>
    </section>
  );
}

function SavingsPreviewCard() {
  return (
    <Card className="text-left shadow-lg border-border">
      <CardContent className="p-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Example audit result
        </p>
        <div className="space-y-3">
          {EXAMPLE_FINDINGS.map((finding) => (
            <div
              key={finding.tool}
              className="flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <CheckCircle
                  className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {finding.tool}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {finding.action}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-emerald-600 shrink-0">
                {finding.saving}
              </span>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Monthly savings</p>
            <p className="text-2xl font-bold text-foreground">$680</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Annual savings</p>
            <p className="text-2xl font-bold text-emerald-600">$8,160</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground italic">
          * Mocked example — your results will vary based on your actual tools and team size.
        </p>
      </CardContent>
    </Card>
  );
}

const EXAMPLE_FINDINGS = [
  {
    tool: "GitHub Copilot Business (12 seats)",
    action: "Downgrade 4 inactive seats",
    saving: "−$76/mo",
  },
  {
    tool: "ChatGPT Team (8 seats)",
    action: "Switch to Claude Team — same capability",
    saving: "−$240/mo",
  },
  {
    tool: "Cursor Business (10 seats)",
    action: "Move 6 light users to Pro plan",
    saving: "−$240/mo",
  },
  {
    tool: "Anthropic API",
    action: "Use Credex credits for 30% off",
    saving: "−$124/mo",
  },
];

// ---------------------------------------------------------------------------
// Social proof bar
// ---------------------------------------------------------------------------

function SocialProofBar() {
  return (
    <section
      aria-label="Social proof"
      className="border-y border-border bg-muted/40 py-6"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-5">
          Works with the tools your team already uses
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {SUPPORTED_TOOLS.map((tool) => (
            <span
              key={tool}
              className="text-sm font-medium text-muted-foreground"
            >
              {tool}
            </span>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          * Social proof numbers are mocked for illustration — to be replaced with real data post-launch.
        </p>
      </div>
    </section>
  );
}

const SUPPORTED_TOOLS = [
  "Cursor",
  "GitHub Copilot",
  "Claude",
  "ChatGPT",
  "Anthropic API",
  "OpenAI API",
  "Gemini",
  "Windsurf",
];

// ---------------------------------------------------------------------------
// How it works
// ---------------------------------------------------------------------------

function HowItWorksSection() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="mx-auto max-w-5xl px-4 sm:px-6 py-20"
    >
      <div className="text-center mb-12">
        <h2
          id="how-it-works-heading"
          className="text-2xl sm:text-3xl font-bold tracking-tight"
        >
          How it works
        </h2>
        <p className="mt-3 text-muted-foreground">
          Three steps. No account needed.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {STEPS.map((step, i) => (
          <div key={step.title} className="flex flex-col items-center text-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold"
              aria-hidden="true"
            >
              {i + 1}
            </div>
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
              <step.icon className="h-5 w-5 text-foreground" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-foreground">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: Zap,
    title: "Enter your tools",
    description:
      "Select which AI tools your team uses, your plan, number of seats, and monthly spend.",
  },
  {
    icon: TrendingDown,
    title: "Get your audit",
    description:
      "Our engine checks every tool against current pricing and flags overspend, wrong plans, and cheaper alternatives.",
  },
  {
    icon: Shield,
    title: "See your savings",
    description:
      "Get a per-tool breakdown with exact monthly and annual savings — and a shareable link to send to your team.",
  },
];

// ---------------------------------------------------------------------------
// What you get
// ---------------------------------------------------------------------------

function WhatYouGetSection() {
  return (
    <section
      aria-labelledby="what-you-get-heading"
      className="bg-muted/40 border-y border-border py-20"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2
            id="what-you-get-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight"
          >
            What you get
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="bg-background">
              <CardContent className="p-6 flex gap-4">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"
                  aria-hidden="true"
                >
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: TrendingDown,
    title: "Per-tool savings breakdown",
    description:
      "See exactly which tool is costing you the most and what to do about it — with a one-line reason for every recommendation.",
  },
  {
    icon: Zap,
    title: "Instant results, no login",
    description:
      "No account, no credit card. Enter your tools and get your audit in under 10 seconds.",
  },
  {
    icon: CheckCircle,
    title: "Shareable audit URL",
    description:
      "Every audit gets a unique public link. Share it with your CTO, CFO, or team — no PII included.",
  },
  {
    icon: Shield,
    title: "Honest when you're spending well",
    description:
      "If your spend is already optimized, we'll tell you that too. No fake savings numbers.",
  },
];

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

function FaqSection() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="mx-auto max-w-3xl px-4 sm:px-6 py-20"
    >
      <div className="text-center mb-12">
        <h2
          id="faq-heading"
          className="text-2xl sm:text-3xl font-bold tracking-tight"
        >
          Common questions
        </h2>
      </div>

      <div className="space-y-6">
        {FAQS.map((faq) => (
          <div key={faq.q}>
            <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {faq.a}
            </p>
            <Separator className="mt-6" />
          </div>
        ))}
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "Is this actually free?",
    a: "Yes. The audit is completely free with no login required. We capture your email after showing you results — never before.",
  },
  {
    q: "How accurate are the savings numbers?",
    a: "All pricing data is sourced directly from official vendor pricing pages and verified weekly. The audit engine uses hardcoded rules — no AI guesswork in the math.",
  },
  {
    q: "What does Credex do?",
    a: "Credex is an AI infrastructure credits company. For teams with high AI spend, Credex can negotiate bulk credits that reduce your effective per-token cost. The audit surfaces this as an option when it makes sense.",
  },
  {
    q: "Will you spam me?",
    a: "No. You get one confirmation email with your audit results. If your savings are above $500/month, a Credex team member may reach out — but only once, and only if you opt in.",
  },
  {
    q: "Can I share my audit results?",
    a: "Yes. Every audit gets a unique public URL you can share with your team or leadership. The public view strips your email and company name — only tool data and savings numbers are shown.",
  },
];

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Built by{" "}
          <a
            href={CREDEX_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Credex
          </a>{" "}
          — AI infrastructure credits for startups.
        </p>
        <p className="text-xs text-muted-foreground">
          Pricing data verified from official vendor pages.
        </p>
      </div>
    </footer>
  );
}
