-- Community sharing is intentionally routed through /api/community so the app
-- can rate-limit and validate public submissions before writing with the
-- Supabase service role.

do $$
begin
  if to_regclass('public.community_entries') is not null then
    drop policy if exists "Anyone can share to community"
      on public.community_entries;
  end if;
end
$$;
