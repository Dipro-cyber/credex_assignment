# ARCHITECTURE — AI Spend Audit

## System Diagram

> _Mermaid diagram to be added in Commit 11._

```mermaid
flowchart TD
    A[User lands on /] --> B[Spend Input Form]
    B --> C[localStorage persistence]
    B --> D[POST /api/audit]
    D --> E[Audit Engine — hardcoded rules]
    E --> F[Anthropic API — personalized summary]
    F --> G[Save AuditResult to Supabase]
    G --> H[Return audit ID + results]
    H --> I[Results Page /audit/id]
    I --> J{Savings threshold}
    J -->|> $500/mo| K[Credex CTA]
    J -->|< $100/mo| L[You're spending well + notify me]
    I --> M[Email capture form]
    M --> N[POST /api/leads]
    N --> O[Store lead in Supabase]
    N --> P[Send confirmation via Resend]
    I --> Q[Share button → /share/id]
    Q --> R[Public URL — PII stripped, OG tags]
```

## Stack Justification

> _To be filled in Commit 11._

## Scaling to 10k Audits/Day

> _To be filled in Commit 11._
