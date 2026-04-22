-- ============================================
-- Phase 13: Repair missing "Första Raden" badges
-- ============================================
-- Idempotent: safe to re-run.
--
-- Some existing users have one or more saved entries but never received
-- the first-entry badge. Ensure every user with at least one owned entry
-- has `forsta-raden` recorded in `user_badges`.

insert into public.user_badges (user_id, badge_id, earned_at, seen_at)
select distinct
  e.user_id,
  'forsta-raden',
  now(),
  now()
from public.entries e
where e.user_id is not null
on conflict (user_id, badge_id) do nothing;
