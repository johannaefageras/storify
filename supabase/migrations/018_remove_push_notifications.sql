drop table if exists public.push_sends;
drop table if exists public.push_subscriptions;

drop index if exists profiles_push_enabled_idx;

alter table public.profiles
  drop column if exists push_reminders_enabled;
