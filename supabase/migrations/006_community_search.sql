-- ==========================================================================
-- Filter indexes for community_entries
-- Run this in Supabase Dashboard → SQL Editor
-- ==========================================================================

-- 1. Index on tone_id for voice filtering
create index if not exists idx_community_entries_tone_id
  on community_entries (tone_id);

-- 2. Index on entry_date for date range filtering
create index if not exists idx_community_entries_entry_date
  on community_entries (entry_date);

-- 3. Trigram index on generated_text for ILIKE search (requires pg_trgm)
create extension if not exists pg_trgm;

create index if not exists idx_community_entries_text_trgm
  on community_entries using gin (generated_text gin_trgm_ops);
