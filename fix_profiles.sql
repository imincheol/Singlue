-- 1. ADD EMAIL COLUMN TO PROFILES
alter table public.profiles 
add column if not exists email text;

-- 2. UPDATE TRIGGER TO INCLUDE EMAIL
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname, email, role, status)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'nickname', 'User'),
    new.email, -- Copy email from auth.users
    'user',
    'pending'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 3. SYNC EXISTING USERS (Backfill email)
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id;

-- 4. PROMOTE FIRST USER TO ADMIN (Run this for your user)
-- Replace 'YOUR_EMAIL_HERE' with your actual email address
update public.profiles
set role = 'admin', status = 'approved', nickname = 'Root Admin'
where email = 'YOUR_EMAIL_HERE'; 

-- Verification
select * from public.profiles;
