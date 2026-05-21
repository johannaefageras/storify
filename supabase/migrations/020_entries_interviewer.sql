-- Adds the interviewer persona used for the `interview` writing mode so we can
-- award the "Tre Samtal" badge (one entry with each of friend/journalist/therapist).
-- Nullable: only set when writing_mode = 'interview'; all existing rows stay NULL.

alter table public.entries
  add column if not exists interviewer text
    check (interviewer is null or interviewer in ('friend', 'journalist', 'therapist'));

create index if not exists idx_entries_user_interviewer
  on public.entries (user_id, interviewer)
  where interviewer is not null;
