-- ============================================
-- Phase 10: Gamification — earned badges per user
-- ============================================
-- Idempotent: safe to re-run.
--
-- The badge catalogue lives in code (src/lib/data/badges.ts) — this table
-- only records which badges a given user has earned. `badge_id` is the
-- string slug from that catalogue; no FK because the source of truth is code.
--
-- seen_at = null means "earned but not yet shown to the user". The client
-- fires a celebration toast for each unseen row, then updates seen_at to
-- mark it as acknowledged (exactly-once UI).
--
-- Count/streak progress state is deliberately NOT modelled here yet — the
-- awarding engine (step 2) will decide whether to derive from existing
-- tables (entries, etc.) or introduce a separate progress table.

create table if not exists public.user_badges (
  user_id uuid references public.profiles(id) on delete cascade not null,
  badge_id text not null,
  earned_at timestamptz not null default now(),
  seen_at timestamptz,
  primary key (user_id, badge_id)
);

create index if not exists user_badges_unseen_idx
  on public.user_badges (user_id)
  where seen_at is null;

alter table public.user_badges enable row level security;

drop policy if exists "Users can view own badges" on public.user_badges;
drop policy if exists "Users can mark own badges seen" on public.user_badges;

create policy "Users can view own badges"
  on public.user_badges for select
  using (auth.uid() = user_id);

-- Update is scoped to seen_at acknowledgement; INSERT and DELETE are
-- intentionally not exposed to clients — awarding runs server-side via
-- service role, and earned badges are permanent.
create policy "Users can mark own badges seen"
  on public.user_badges for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
