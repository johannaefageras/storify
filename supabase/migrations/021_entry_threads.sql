-- entry_threads: structured "open threads" extracted from diary entries.
-- Used to feed the interview chatbot context about unresolved items
-- (an upcoming meeting, an ongoing worry, etc.) from recent entries
-- so it can ask natural follow-up questions on later days.
--
-- Lifecycle (v1, intentionally simple):
--   * extractor inserts rows with status='open' and expires_at = created_at + 14 days
--   * chat endpoint reads rows where status='open' AND expires_at > now() AND created_at >= now() - 7 days
--   * no resolution detection yet — rows just expire
--
-- Deleting an entry must remove its derived threads (privacy + integrity), hence ON DELETE CASCADE.

create table if not exists public.entry_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_id uuid not null references public.entries(id) on delete cascade,
  type text not null check (type in ('upcoming_event', 'ongoing_concern', 'relationship', 'goal')),
  text text not null check (char_length(text) between 1 and 280),
  status text not null default 'open' check (status in ('open', 'expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days')
);

create index if not exists idx_entry_threads_user_active
  on public.entry_threads (user_id, created_at desc)
  where status = 'open';

create index if not exists idx_entry_threads_entry
  on public.entry_threads (entry_id);

alter table public.entry_threads enable row level security;

create policy "entry_threads select own"
  on public.entry_threads for select
  using (auth.uid() = user_id);

create policy "entry_threads insert own"
  on public.entry_threads for insert
  with check (auth.uid() = user_id);

create policy "entry_threads update own"
  on public.entry_threads for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "entry_threads delete own"
  on public.entry_threads for delete
  using (auth.uid() = user_id);
