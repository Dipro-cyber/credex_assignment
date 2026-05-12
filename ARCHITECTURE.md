# ARCHITECTURE — AI Spend Audit

## System Diagram

```mermaid
flowchart TD
    A[User lands on /] --> B[Spend Input Form\n/audit]
    B --> C[localStorage\npersistence]
    B --> D{Submit form}
    D --> E[URL-encoded formState\n→ /audit/results?data=...]
    E --> F[Server Component\nreads searchParams]
    F --> G[Audit Engine\nhardcoded rules only]
    G --> H[AuditResult\nno I/O]
    H --> I[Results Page renders]
    I --> J[Suspense boundary]
    J --> K[Anthropic API\n~100 word summary]
    K --> L[SummarySection\nstreams in]
    I --> M{Savings threshold}
    M -->|≥ $500/mo| N[Credex CTA\nconsultation link]
    M -->|< $100/mo| O[Spending well\n+ notify me]
    I --> P[Email capture form\nshown after results]
    P --> Q[POST /api/leads]
    Q --> R[Rate limit check\nUpstash Redis]
    R --> S[Supabase\nleads table]
    R --> T[Resend\nconfirmation email]
    I --> U[Share button]
    U --> V[POST /api/audit\nsave to Supabase]
    V --> W[/share/id\npublic page]
    W --> X[OG image\nnext/og ImageResponse]
```

## Stack Justification

**Next.js 16 (App Router)**
The App Router's Server Components let the audit engine run server-side with zero client JS for the computation-heavy parts. Suspense streaming means the AI summary loads after the rest of the page — users see results instantly. `params` and `searchParams` as Promises (new in Next.js 15+) required careful handling throughout.

**TypeScript everywhere**
The audit engine is pure TypeScript with no `any` types. This caught several bugs during development — e.g. the `PlanId` union type prevented passing a Cursor plan to a Claude rule function. The type system is the first line of defence for correctness.

**Tailwind CSS v4 + shadcn/ui**
Tailwind v4 uses CSS-native `@theme` variables instead of a JS config file — faster builds, better IDE support. shadcn/ui provides accessible, unstyled primitives that we style ourselves. No pre-built admin templates used.

**Supabase via raw REST API (no SDK)**
The `@supabase/supabase-js` SDK adds ~200KB to the server bundle. Since we only need two operations (insert lead, fetch audit by ID), raw `fetch` against the PostgREST API is sufficient and keeps the bundle lean. The tradeoff is more verbose code in `src/lib/supabase.ts`.

**Resend for transactional email**
Resend has a clean REST API, generous free tier (3,000 emails/month), and first-class Next.js support. Alternatives considered: SendGrid (more complex), Postmark (more expensive), AWS SES (requires more setup). Resend wins on simplicity for an MVP.

**Upstash Redis for rate limiting**
Serverless-compatible (HTTP REST, no persistent connection). Free tier covers 10,000 requests/day. Alternative was Vercel KV (same underlying tech, slightly more expensive). In-memory Map fallback means the app works locally without Redis configured.

**Vitest for testing**
Vitest uses the same config format as Vite, supports TypeScript natively, and is significantly faster than Jest for this project size. The `@/*` path alias works out of the box with the `resolve.alias` config. 31 tests run in ~350ms.

---

## What Would Change to Handle 10k Audits/Day

At 10k audits/day (~7 req/sec average, higher at peak):

**1. Move audit computation to an API route**
Currently the audit engine runs in a Server Component on every page load. At scale, move it to `POST /api/audit/run` so results can be cached and the computation is isolated. Return the audit ID and redirect to `/audit/[id]` — the results page becomes a static fetch from Supabase.

**2. Cache audit results**
Store every audit result in Supabase (not just shared ones). Use `next: { revalidate: 3600 }` on the results fetch — identical form states return cached results instantly. This also enables analytics on which tools/plans are most commonly audited.

**3. Supabase connection pooling**
At 7 req/sec, direct Supabase REST calls are fine. Above ~50 req/sec, add PgBouncer (built into Supabase) or switch to the Supabase JS SDK with connection pooling enabled.

**4. Rate limiting at the edge**
Move rate limiting from the API route to Next.js middleware so it runs at the CDN edge before the request hits the server. Upstash Redis supports this pattern natively.

**5. Anthropic API budget**
At 10k audits/day with ~300 tokens per summary, that's ~3M tokens/day on claude-3-5-haiku (~$2.40/day at $0.80/MTok). Acceptable. Add a circuit breaker: if the Anthropic error rate exceeds 5% in a 1-minute window, skip the API call and return the fallback summary for all requests until the window resets.

**6. Email queue**
Replace the fire-and-forget `sendAuditEmail()` call with a Supabase Edge Function triggered by a database insert. This decouples email sending from the API response and provides automatic retries on failure.
