-- The Black Tier — CRM schema (run in Supabase → SQL Editor)
create extension if not exists "pgcrypto";

-- Public inquiries (submitted from the website search form)
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  buyer_type text,
  residence text,
  horizon text,
  finance text,
  categories text[] default '{}',
  regions text[] default '{}',
  budget_from numeric,
  budget_to numeric,
  features text[] default '{}',
  rooms_min int,
  area_min int,
  plot_min int,
  detail text,
  discretion text,
  contact_pref text,
  lang text,
  status text not null default 'new'
);

-- Off-market holdings (objects / projects / assets)
create table if not exists holdings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  category text,
  region text,
  address text,
  price numeric,
  rooms int,
  area int,
  plot int,
  broker text,
  broker_email text,
  description text
);

-- General contacts
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text,
  phone text,
  kind text,
  categories text[] default '{}',
  notes text
);
-- Migration for an existing database (safe to re-run):
alter table contacts add column if not exists categories text[] default '{}';

-- Sent email log (written by the /api/send serverless function)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  to_email text not null,
  subject text not null,
  body text not null,
  kind text,
  inquiry_id uuid references inquiries(id) on delete set null,
  status text,
  resend_id text,
  created_by text
);

-- Row Level Security ---------------------------------------------------------
alter table inquiries enable row level security;
alter table holdings  enable row level security;
alter table contacts  enable row level security;
alter table messages  enable row level security;

-- Anyone (anonymous website visitor) may SUBMIT an inquiry, but not read them.
drop policy if exists "anyone can submit inquiry" on inquiries;
create policy "anyone can submit inquiry" on inquiries
  for insert to anon, authenticated with check (true);

-- Staff = any authenticated user → full access to the CRM.
drop policy if exists "staff read inquiries" on inquiries;
create policy "staff read inquiries" on inquiries for select to authenticated using (true);
drop policy if exists "staff update inquiries" on inquiries;
create policy "staff update inquiries" on inquiries for update to authenticated using (true) with check (true);
drop policy if exists "staff delete inquiries" on inquiries;
create policy "staff delete inquiries" on inquiries for delete to authenticated using (true);

drop policy if exists "staff all holdings" on holdings;
create policy "staff all holdings" on holdings for all to authenticated using (true) with check (true);

drop policy if exists "staff all contacts" on contacts;
create policy "staff all contacts" on contacts for all to authenticated using (true) with check (true);

drop policy if exists "staff read messages" on messages;
create policy "staff read messages" on messages for select to authenticated using (true);
drop policy if exists "staff insert messages" on messages;
create policy "staff insert messages" on messages for insert to authenticated with check (true);
