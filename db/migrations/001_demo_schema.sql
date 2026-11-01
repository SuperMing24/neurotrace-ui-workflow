-- Synthetic NeuroTrace demonstration schema (not applied to any database).
create extension if not exists pgcrypto;
create table if not exists demo_tasks (
  id text primary key,
  title text not null,
  synthetic_graph jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists demo_sessions (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null,
  task_id text not null references demo_tasks(id),
  created_at timestamptz not null default now(),
  unique(actor_id, task_id)
);
create table if not exists demo_edges (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references demo_sessions(id) on delete cascade,
  endpoint_a text not null,
  endpoint_b text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  check(endpoint_a <> endpoint_b)
);
create table if not exists demo_edit_events (
  id bigint generated always as identity primary key,
  session_id uuid not null references demo_sessions(id) on delete cascade,
  edge_id uuid references demo_edges(id),
  action text not null check(action in ('connect','delete','undo')),
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);
-- Important: Do NOT expose these tables as anonymous public-write endpoints.
-- Require authorization and server-side validation in API handlers.
