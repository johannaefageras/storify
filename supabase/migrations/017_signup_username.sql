-- ============================================
-- 017: Allow username to be set at signup
-- ============================================

-- Extend handle_new_user to read username from raw_user_meta_data.
-- Format/uniqueness violations bubble up as signup errors; client pre-validates.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  meta_username text;
begin
  meta_username := nullif(lower(trim(new.raw_user_meta_data->>'username')), '');

  insert into public.profiles (id, email, username)
  values (new.id, new.email, meta_username);

  return new;
end;
$$ language plpgsql security definer;

-- Public availability check used by the signup form.
-- security definer bypasses RLS so anon can probe without exposing profile rows.
create or replace function public.is_username_available(p_username text)
returns boolean as $$
  select not exists (
    select 1 from public.profiles
    where lower(username) = lower(p_username)
  );
$$ language sql stable security definer set search_path = public;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;
