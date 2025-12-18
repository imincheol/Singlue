-- 1. DROP RECURSIVE POLICIES (PROFILES)
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;

-- 2. DROP RECURSIVE POLICIES (SONGS)
drop policy if exists "Admins can update any song" on public.songs;

-- 3. CREATE SAFE ADMIN CHECK FUNCTION
-- 'SECURITY DEFINER' allows this function to bypass RLS when checking the table
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 4. RE-CREATE POLICIES USING SAFE FUNCTION

-- Profiles: Admins can read all
create policy "Admins can read all profiles" 
  on public.profiles for select 
  using ( public.is_admin() );

-- Profiles: Admins can update all
create policy "Admins can update all profiles" 
  on public.profiles for update
  using ( public.is_admin() );

-- Songs: Admins can update any song
create policy "Admins can update any song" 
  on public.songs for update
  using ( public.is_admin() );

-- Verify
select * from public.profiles limit 1;
