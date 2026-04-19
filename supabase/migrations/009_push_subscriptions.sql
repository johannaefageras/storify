-- ============================================
-- Phase 9: Web Push subscriptions for journal reminders
-- ============================================
-- Idempotent: safe to re-run.

-- 1. Opt-in flag on profiles (matches newsletter_weekly_enabled pattern)
alter table public.profiles
  add column if not exists push_reminders_enabled boolean not null default false;

create index if not exists profiles_push_enabled_idx
  on public.profiles (push_reminders_enabled)
  where push_reminders_enabled = true;

-- 2. One row per (user, device). A user may have multiple subscriptions —
--    different browsers, PWA installs, or the Capacitor wrapper.
--    Endpoint is globally unique per PushManager subscription, so it's the
--    natural dedup key; upsert on conflict.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  endpoint text not null unique,
  p256dh text not null,                        -- client public key (base64url)
  auth text not null,                          -- client auth secret (base64url)
  platform text not null default 'web'
    check (platform in ('web', 'ios', 'android')),
  user_agent text,
  created_at timestamptz not null default now(),
  last_sent_at timestamptz,
  last_failed_at timestamptz,
  fail_count int not null default 0            -- incremented on 410/404 before delete
);

create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id);

-- 3. RLS: users manage their own subscriptions; cron uses service role.
alter table public.push_subscriptions enable row level security;

drop policy if exists "Users can view own push subscriptions" on public.push_subscriptions;
drop policy if exists "Users can insert own push subscriptions" on public.push_subscriptions;
drop policy if exists "Users can update own push subscriptions" on public.push_subscriptions;
drop policy if exists "Users can delete own push subscriptions" on public.push_subscriptions;

create policy "Users can view own push subscriptions"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own push subscriptions"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own push subscriptions"
  on public.push_subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete own push subscriptions"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

-- 4. Delivery log — parallels newsletter_sends, service-role only.
create table if not exists public.push_sends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  subscription_id uuid references public.push_subscriptions(id) on delete cascade,
  kind text not null,                          -- 'daily_reminder' | future kinds
  sent_at timestamptz not null default now(),
  status_code int,                             -- web-push response status; null on send exception
  error text
);

create index if not exists push_sends_user_kind_sent_idx
  on public.push_sends (user_id, kind, sent_at desc);

alter table public.push_sends enable row level security;
-- No policies = service role only.
