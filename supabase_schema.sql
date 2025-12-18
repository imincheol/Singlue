-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  nickname text,
  role text default 'user' check (role in ('admin', 'user')),
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  gemini_api_key text,
  usage_count integer default 0,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for Profiles
-- 1. Users can read their own profile
create policy "Users can read own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

-- 2. Admins can read all profiles
create policy "Admins can read all profiles" 
  on public.profiles for select 
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 3. Admins can update status/role
create policy "Admins can update profiles" 
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
  
-- 4. Users can update their own profile (for API Key)
create policy "Users can update own profile" 
  on public.profiles for update
  using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname, role, status, usage_count)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'nickname', 'User'),
    'user',
    'pending', -- Default status is pending, but login will be allowed
    0
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. SONGS TABLE
create table if not exists public.songs (
  id uuid default uuid_generate_v4() primary key,
  video_id text not null,
  title text,
  artist text,
  lyrics jsonb default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete cascade not null,
  stage integer default 1 check (stage in (1, 2, 3)),
  is_public boolean default false,
  global_offset real default 0,
  created_at timestamp with time zone default now(),
  published_at timestamp with time zone -- Set when stage becomes 3
);

-- Enable RLS
alter table public.songs enable row level security;

-- Policies for Songs
-- 1. Public songs are viewable by everyone (Guest + User)
create policy "Public songs are viewable by everyone" 
  on public.songs for select 
  using (is_public = true and stage = 3);

-- 2. Users can see their own songs (Drafts + Private)
create policy "Users can see own songs" 
  on public.songs for select 
  using (auth.uid() = created_by);

-- 3. Approved Users can insert songs
create policy "Approved users can insert songs" 
  on public.songs for insert 
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and status = 'approved'
    )
  );

-- 4. Authors can update their own songs
create policy "Authors can update own songs" 
  on public.songs for update
  using (auth.uid() = created_by);

-- 5. Admins can update any song (Optional, good for moderation)
create policy "Admins can update any song" 
  on public.songs for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- Initial Admin Setup (Self-Bootstrap Helper)
-- To make yourself an admin, run this SQL manually after signing up:
-- update public.profiles set role = 'admin', status = 'approved' where id = 'YOUR_UUID_HERE';
