-- ============================================
-- Phase 12: Retroactive badge awarding
-- ============================================
-- Idempotent: safe to re-run.
--
-- Tracks whether the server-side retroactive badge sweep has run for a user.
-- The sweep scans existing entries + profile state and awards every badge
-- whose criterion is DB-derivable (~80% of the catalogue). Event-only badges
-- (random-tone-used, read-fine-print, etc.) still require the event to fire.
--
-- Timestamp rather than boolean so we can tell *when* a user was backfilled,
-- which matters if we extend the catalogue later and need a second sweep.

alter table public.profiles
  add column if not exists badges_backfilled_at timestamptz;
