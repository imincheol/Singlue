-- 1. FIX PROFILES TABLE (Add email column if missing)
alter table public.profiles 
add column if not exists email text;

-- 2. UPDATE TRIGGER (Ensure future signups get email and nickname)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname, email, role, status)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'nickname', 'User'),
    new.email,
    'user',
    'pending'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 3. VARIABLES : SET YOUR EMAIL HERE
-- (You can run the below block by replacing 'test@example.com' with your actual email)

DO $$ 
DECLARE
    target_email text := 'imincheol@gmail.com'; -- REPLACE THIS WITH YOUR EMAIL IF DIFFERENT
BEGIN
    -- A. CONFIRM EMAIL (Fixes "Email not confirmed" error)
    UPDATE auth.users
    SET email_confirmed_at = now()
    WHERE email = target_email;

    -- B. SYNC PROFILE EMAIL (Fixes missing email in profile)
    UPDATE public.profiles p
    SET email = u.email
    FROM auth.users u
    WHERE p.id = u.id AND p.email IS NULL;

    -- C. PROMOTE TO ADMIN (Fixes permission and status)
    UPDATE public.profiles
    SET role = 'admin', 
        status = 'approved',
        nickname = COALESCE(nickname, 'Root Admin')
    WHERE email = target_email;
    
END $$;

-- 4. VERIFY RESULTS
SELECT * FROM public.profiles;
