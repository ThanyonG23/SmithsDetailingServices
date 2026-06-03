-- ============================================================
--  SMITHS DETAILING — SUPABASE SCHEMA
--  Run this once in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  status        text not null default 'confirmed',  -- confirmed | cancelled

  -- customer
  customer_name text not null,
  email         text not null,
  phone         text,
  address       text,
  notes         text,

  -- service
  vehicle       text not null,
  package_key   text not null,
  package_name  text not null,
  duration_min  int  not null,
  slot          text not null,                       -- '0700' | '1300'
  start_at      timestamptz not null,
  end_at        timestamptz not null,

  -- pricing
  extras        jsonb   not null default '[]',
  extras_total  numeric not null default 0,
  base_price    numeric not null default 0,
  total_price   numeric not null default 0,

  -- marketing attribution (optional)
  source        text default 'website',
  gclid         text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  landing_url   text,
  referrer      text
);

-- fast availability lookups
create index if not exists bookings_start_at_idx on public.bookings (start_at);
create index if not exists bookings_status_idx   on public.bookings (status);

-- ------------------------------------------------------------
-- Row Level Security:
-- Enable RLS and create NO public policies. All reads/writes go
-- through the server using the service_role key, which bypasses
-- RLS. This means the browser can never read or write bookings
-- directly — only your API routes can.
-- ------------------------------------------------------------
alter table public.bookings enable row level security;
