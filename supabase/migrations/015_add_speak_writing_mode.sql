-- Allow voice-recorded diary entries to be tracked separately from quick mode.

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'entries'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) like '%writing_mode%'
  loop
    execute format('alter table public.entries drop constraint %I', constraint_name);
  end loop;
end $$;

alter table public.entries
  add constraint entries_writing_mode_check
  check (writing_mode is null or writing_mode in ('wizard', 'quick', 'interview', 'manual', 'speak'));
