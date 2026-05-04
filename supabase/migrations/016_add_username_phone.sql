-- ============================================
-- 016: Add username and phone to profiles
-- ============================================

alter table public.profiles
  add column if not exists username text,
  add column if not exists phone text;

-- Username: 3-20 chars, lowercase alphanumeric or underscore.
alter table public.profiles
  drop constraint if exists profiles_username_format;
alter table public.profiles
  add constraint profiles_username_format check (
    username is null or username ~ '^[a-z0-9_]{3,20}$'
  );

-- Case-insensitive uniqueness; NULLs are allowed (multiple users may have no username).
drop index if exists profiles_username_unique;
create unique index profiles_username_unique
  on public.profiles (lower(username))
  where username is not null;

-- Phone: relaxed format — digits, spaces, parens, dashes, optional leading '+'.
-- Stored as-is; not used for auth.
alter table public.profiles
  drop constraint if exists profiles_phone_format;
alter table public.profiles
  add constraint profiles_phone_format check (
    phone is null or phone ~ '^\+?[0-9 ()-]{6,20}$'
  );
