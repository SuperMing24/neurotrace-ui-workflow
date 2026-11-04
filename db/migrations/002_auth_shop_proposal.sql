-- NeuroTrace educational demonstration: FUTURE CLOUD DATABASE SCHEMA PROPOSAL.
-- This migration has NOT been applied. Provider OAuth and real-order fulfillment are NOT configured.
-- Do not expose database roles or secrets to the browser.
create extension if not exists pgcrypto;
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  nickname_title text,
  demo_account boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists auth_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  provider text not null check (provider in ('wechat','qq','demo')),
  provider_user_id text not null,
  linked_at timestamptz not null default now(),
  unique(provider,provider_user_id)
);
create table if not exists shop_items (
 id text primary key,
 title text not null,
 description text not null,
 image_path text,
 points_cost integer not null check(points_cost>=0),
 stock integer,
 redeemable boolean not null default false,
 updated_at timestamptz not null default now()
);
create table if not exists points_ledger (
 id bigint generated always as identity primary key,
 user_id uuid not null references app_users(id),
 delta integer not null,
 reason text not null,
 reference_id text,
 created_at timestamptz not null default now()
);
create table if not exists redemption_orders (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references app_users(id),
 item_id text not null references shop_items(id),
 points_cost integer not null,
 status text not null default 'pending' check(status in ('pending','approved','shipped','delivered','cancelled')),
 created_at timestamptz not null default now()
);
create index if not exists ix_redemption_orders_user on redemption_orders(user_id,created_at desc);
-- Future: session service with hashed tokens, server-side OAuth code verification and CSRF state.
-- Future: shipping address belongs in a protected PII subsystem, not a public demo.
-- API must check authentication, atomic points debit + stock decrement, idempotency keys,
-- and record audit history to prevent duplicate point redemption or overdraw.