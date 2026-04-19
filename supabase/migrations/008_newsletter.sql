-- ============================================
-- Phase 8: Newsletter subscriptions and delivery log
-- ============================================

-- 1. Extend profiles
alter table public.profiles
  add column email text,                                                       -- mirrored from auth.users for cron joins
  add column timezone text not null default 'Europe/Stockholm',
  add column newsletter_weekly_enabled boolean not null default false,
  add column newsletter_monthly_enabled boolean not null default false,
  add column newsletter_unsubscribe_token uuid not null default gen_random_uuid() unique,
  add column weekly_last_sent_at timestamptz;

create index profiles_weekly_enabled_idx
  on public.profiles (newsletter_weekly_enabled)
  where newsletter_weekly_enabled = true;

-- 2. Backfill emails from auth.users for existing accounts
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- 3. Keep email in sync on signup (extend existing handle_new_user)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- 4. Keep email in sync on email change
create or replace function public.sync_profile_email()
returns trigger as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.sync_profile_email();

-- 5. Delivery log (idempotency, debugging, compliance audit)
create table public.newsletter_sends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  kind text not null check (kind in ('weekly', 'monthly')),
  variant text,                                  -- 'recap' | 'nudge' | (future variants)
  sent_at timestamptz not null default now(),
  resend_message_id text,
  entry_ids uuid[] not null default '{}',        -- entries referenced in this email
  error text                                     -- non-null if send failed; row still inserted
);

create index newsletter_sends_user_kind_sent_idx
  on public.newsletter_sends (user_id, kind, sent_at desc);

-- 6. RLS for newsletter_sends (service role only — no user-facing read path)
alter table public.newsletter_sends enable row level security;
-- No policies = service role only (which bypasses RLS).
