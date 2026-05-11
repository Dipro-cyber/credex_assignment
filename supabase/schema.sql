-- AI Spend Audit — Supabase Schema
-- Run this in the Supabase SQL editor to set up the database.
-- https://supabase.com/dashboard/project/<your-project>/sql

-- ---------------------------------------------------------------------------
-- leads table
-- Stores email captures from the audit results page.
-- ---------------------------------------------------------------------------

create table if not exists public.leads (
  id                    uuid primary key default gen_random_uuid(),
  audit_id              text not null,
  email                 text not null,
  company_name          text,
  role                  text,
  team_size             integer,
  total_monthly_savings integer not null default 0,
  created_at            timestamptz not null default now()
);

-- Index for deduplication lookups (audit_id + email)
create index if not exists leads_audit_email_idx
  on public.leads (audit_id, email);

-- Index for querying leads by email (e.g. unsubscribe)
create index if not exists leads_email_idx
  on public.leads (email);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

-- Enable RLS — the service role key bypasses RLS, so inserts from the
-- API route work fine. The anon key cannot read or write this table.
alter table public.leads enable row level security;

-- No public read access — leads are internal only
create policy "No public read" on public.leads
  for select using (false);

-- No public insert — all inserts go through the service role key in the API
create policy "No public insert" on public.leads
  for insert with check (false);

-- ---------------------------------------------------------------------------
-- audits table (optional — for storing full audit results for share URLs)
-- Populated in Commit 8 when shareable URLs are implemented.
-- ---------------------------------------------------------------------------

create table if not exists public.audits (
  id            uuid primary key,
  form_state    jsonb not null,
  tool_results  jsonb not null,
  total_monthly_savings  integer not null default 0,
  total_annual_savings   integer not null default 0,
  created_at    timestamptz not null default now()
);

-- Index for share URL lookups
create index if not exists audits_id_idx on public.audits (id);

alter table public.audits enable row level security;

-- Public read — share URLs need to be publicly accessible
create policy "Public read audits" on public.audits
  for select using (true);

-- No public insert — all inserts go through the service role key
create policy "No public insert audits" on public.audits
  for insert with check (false);
