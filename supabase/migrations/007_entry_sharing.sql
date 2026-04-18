-- Public sharing of entries via /shared/{share_id}
--
-- - share_id: short random token used in public URLs (never expose entry UUID)
-- - is_public: opt-in flag; only public rows are readable by anon
-- - user_id: now nullable so anonymous (pre-signup) generations can be shared.
--   Anon shares are cleaned up by a separate scheduled job using created_at.

alter table public.entries alter column user_id drop not null;

alter table public.entries add column share_id text unique;
alter table public.entries add column is_public boolean not null default false;

create index entries_share_id_idx on public.entries (share_id) where share_id is not null;

-- Anon reads: allow select when the row is explicitly marked public.
create policy "Public can view shared entries"
  on public.entries for select
  using (is_public = true);

-- Allow owners to toggle is_public/share_id (covered by existing update policy,
-- which uses auth.uid() = user_id).

-- Anon inserts for ephemeral sharing of not-yet-saved entries.
-- Only allowed when user_id is null AND the row is immediately public.
create policy "Anon can insert public shareable entries"
  on public.entries for insert
  with check (user_id is null and is_public = true);
