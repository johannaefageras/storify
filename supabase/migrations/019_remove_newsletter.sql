drop table if exists public.newsletter_sends;

drop index if exists profiles_weekly_enabled_idx;

alter table public.profiles
  drop column if exists newsletter_weekly_enabled,
  drop column if exists newsletter_monthly_enabled,
  drop column if exists newsletter_unsubscribe_token,
  drop column if exists weekly_last_sent_at;
