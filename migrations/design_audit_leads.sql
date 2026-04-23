-- Design Audit — leads table for the Psychoactive CRM Supabase.
--
-- Run this once in the CRM Supabase SQL editor. Idempotent — safe to
-- re-run. The site writes to this table via the service_role key from
-- the Nitro server routes at /api/audit and /api/audit-submit-lead.
--
-- Lifecycle:
--   1. /api/audit runs an audit, returns results to the page, and
--      inserts a row with status='teaser_viewed' + the full report in
--      `full_report`. `email` is null at this stage.
--   2. When the user submits the email form, /api/audit-submit-lead
--      updates that row with email/name/company and flips status to
--      'full_report_unlocked'.

create extension if not exists "pgcrypto";

create table if not exists design_audit_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- The site that was audited
  url text not null,
  overall_score integer,
  category_scores jsonb,
  full_report jsonb,

  -- Lead details (filled in on email submit)
  email text,
  name text,
  company text,

  -- Lifecycle: teaser_viewed | full_report_unlocked
  status text not null default 'teaser_viewed',

  -- Request metadata for spam/abuse tracking
  ip_hash text,
  user_agent text
);

create index if not exists design_audit_leads_email_idx
  on design_audit_leads (email);
create index if not exists design_audit_leads_created_at_idx
  on design_audit_leads (created_at desc);
create index if not exists design_audit_leads_status_idx
  on design_audit_leads (status);

-- Touch updated_at on any update.
create or replace function design_audit_leads_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists design_audit_leads_updated_at on design_audit_leads;
create trigger design_audit_leads_updated_at
  before update on design_audit_leads
  for each row execute function design_audit_leads_touch_updated_at();

-- RLS on. Only the service_role key (used by the server) can read/write.
alter table design_audit_leads enable row level security;

-- No policies = no access via anon key. Service role bypasses RLS.
