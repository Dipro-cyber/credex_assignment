# AI Spend Audit — by Credex

A free web app that helps startup founders and engineering managers discover where they're overspending on AI tools (Cursor, GitHub Copilot, Claude, ChatGPT, and more), get an instant savings breakdown, and find out if Credex infrastructure credits can cut their bill further. No login required — results in under 10 seconds.

**Who it's for:** Engineering managers and technical founders at seed-to-Series-B startups paying for multiple AI tools who suspect they're not getting the best value.

---

## Screenshots

![Screenshot 1](./screenshots/Screenshot%20(1337).png)
![Screenshot 2](./screenshots/Screenshot%20(1338).png)
![Screenshot 3](./screenshots/Screenshot%20(1339).png)
![Screenshot 4](./screenshots/Screenshot%20(1340).png)
![Screenshot 5](./screenshots/Screenshot%20(1341).png)
![Screenshot 6](./screenshots/Screenshot%20(1342).png)
![Screenshot 7](./screenshots/Screenshot%20(1343).png)

> Live demo: **https://credexassignment-six.vercel.app**

---

## Quick Start

### Prerequisites

- Node.js ≥ 20.9
- npm ≥ 10

### Install & run locally

```bash
git clone https://github.com/Dipro-cyber/credex_assignment.git
cd credex_assignment
npm install
cp .env.example .env.local
# Fill in .env.local with your keys (see .env.example for descriptions)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app works without any env vars configured — the audit engine is fully offline. You only need env vars for:
- Supabase: lead storage + shareable URLs
- Resend: confirmation emails
- Anthropic: personalized summary (falls back to template if missing)
- Upstash: rate limiting (falls back to in-memory if missing)

### Run tests

```bash
npm run test:run     # single run
npm test             # watch mode
```

### Deploy to Vercel

```bash
npx vercel --prod
```

Set all environment variables from `.env.example` in your Vercel project settings before deploying. The app will function without them but lead capture and email won't work.

---

## Decisions

**1. No SDK dependencies for Supabase or Resend — raw fetch only**

The `@supabase/supabase-js` SDK adds ~200KB to the server bundle. Since we only need two Supabase operations (insert lead, fetch audit by ID), raw `fetch` against the PostgREST API is sufficient. Same for Resend — one POST to their API. The tradeoff is more verbose code in `src/lib/supabase.ts` and `src/lib/email.ts`, but the bundle stays lean and there are zero version conflicts.

**2. Audit engine runs in a Server Component, not an API route**

The form state is URL-encoded and passed as a search param to `/audit/results`. The Server Component reads it, runs the engine, and renders the results — no client-side JavaScript for the computation. This means results are available on first paint with no loading state. The tradeoff: the URL can get long with many tools. Acceptable for an MVP; at scale, move to a POST + redirect pattern with Supabase storage.

**3. AI summary uses Suspense streaming, not blocking**

The Anthropic API call is wrapped in a `<Suspense>` boundary. The rest of the results page renders immediately; the summary streams in after. This means a slow or failed API call never degrades the core experience. The fallback template is written to sound natural — users shouldn't notice the difference.

**4. Rate limiting fails open**

If Upstash Redis is unavailable, the rate limiter returns `{ allowed: true }` and falls back to an in-memory Map. The decision: a Redis outage should not block legitimate users from submitting their email. The tradeoff is that a determined attacker could bypass rate limiting during an outage. Acceptable for a free tool — the honeypot field provides a second layer of bot protection.

**5. Windsurf pricing updated mid-project**

Windsurf raised Pro from $15 to $20/month in March 2026 (matching Cursor). This was discovered during the PRICING_DATA.md research pass and required updating `src/lib/audit/pricing.ts` and `src/lib/tools-config.ts`. The lesson: pricing data has a shelf life. The `PRICING_DATA.md` verification dates exist precisely to flag when a re-check is needed.

---

## Deployed URL

**https://credexassignment-six.vercel.app**
