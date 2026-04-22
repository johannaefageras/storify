-- ============================================
-- Phase 11: Writing-mode column on entries (gamification prereq)
-- ============================================
-- Idempotent: safe to re-run.
--
-- Required by mode-based badges (`entries-by-mode`, `all-writing-modes-used`).
-- Nullable so existing rows don't need backfilling — historical entries
-- simply don't count toward mode-based badges, which is fine since the
-- awarding engine is event-driven and forward-looking.

alter table public.entries
  add column if not exists writing_mode text
    check (writing_mode is null or writing_mode in ('wizard', 'quick', 'interview', 'manual'));

-- Partial index supports per-mode count queries (e.g. "how many interview
-- entries does user X have?") without bloating the index with historical
-- nulls.
create index if not exists entries_user_mode_idx
  on public.entries (user_id, writing_mode)
  where writing_mode is not null;
