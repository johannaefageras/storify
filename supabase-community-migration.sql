-- ==========================================================================
-- Community Entries Table
-- Allows users (logged in or anonymous) to share diary entries publicly.
-- Run this in Supabase Dashboard → SQL Editor
-- ==========================================================================

create table if not exists community_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,  -- null = anonymous
  created_at timestamptz default now() not null,
  display_name text not null default 'Anonym',
  entry_date text not null,                                     -- e.g. '2026-03-26'
  tone_id text not null,
  generated_text text not null,
  excerpt text not null,                                        -- first ~150 chars
  emojis text[] default '{}',
  weekday text
);

-- Index for fast newest-first pagination
create index if not exists idx_community_entries_created_at
  on community_entries (created_at desc);

-- ==========================================================================
-- Row Level Security
-- ==========================================================================

alter table community_entries enable row level security;

-- Anyone can read community entries (no login required)
create policy "Community entries are publicly readable"
  on community_entries
  for select
  using (true);

-- Anyone can insert (both logged-in and anonymous via anon key)
create policy "Anyone can share to community"
  on community_entries
  for insert
  with check (true);

-- Only the author can delete their own entry (logged-in users only)
create policy "Authors can delete own community entries"
  on community_entries
  for delete
  using (auth.uid() = user_id);
