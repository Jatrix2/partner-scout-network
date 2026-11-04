-- ============================================================
-- Partner Hub — turnkey setup for a brand-new, empty database.
-- Run the whole file in your Supabase project's SQL editor
-- (or `psql`). Safe to run only once, on an empty project.
--
-- Creates: roles table (10-admin cap), profiles, skills,
-- agent_skills, projects, contact_methods, reviews, blog_posts,
-- all grants + Row Level Security policies, and the
-- "first signup becomes admin" bootstrap trigger.
--
-- After this, sign up at /auth on the deployed site: the very
-- first account becomes the network admin automatically.
-- Optional demo content lives in demo-seed.sql (run separately).
-- ============================================================

create type public.app_role as enum ('admin','member');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  partner_id text unique not null,
  full_name text not null default '',
  headline text,
  bio text,
  avatar_url text,
  location text,
  approved boolean not null default false,
  added_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.agent_skills (
  agent_id uuid references public.profiles(id) on delete cascade not null,
  skill_id uuid references public.skills(id) on delete cascade not null,
  for_ecom boolean not null default false,
  for_exec boolean not null default false,
  primary key (agent_id, skill_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  result text,
  url text,
  for_ecom boolean not null default false,
  for_exec boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.contact_methods (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null,
  label text,
  value text not null,
  is_primary_ecom boolean not null default false,
  is_primary_exec boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index contact_methods_one_primary_ecom on public.contact_methods (agent_id) where is_primary_ecom;
create unique index contact_methods_one_primary_exec on public.contact_methods (agent_id) where is_primary_exec;

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.profiles(id) on delete cascade not null,
  author_name text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  content text not null,
  source_view text not null default 'ecom' check (source_view in ('ecom','exec')),
  created_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  excerpt text,
  body text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT ON public.skills TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
GRANT SELECT ON public.agent_skills TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.agent_skills TO authenticated;
GRANT ALL ON public.agent_skills TO service_role;
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
GRANT SELECT ON public.contact_methods TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.contact_methods TO authenticated;
GRANT ALL ON public.contact_methods TO service_role;
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, DELETE ON public.reviews TO authenticated;
GRANT INSERT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create or replace function public.assert_admin_cap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_count int;
begin
  if new.role = 'admin' then
    select count(*) into admin_count from public.user_roles where role = 'admin';
    if admin_count >= 10 then
      raise exception 'Admin limit reached: there can only be 10 admins at any given time';
    end if;
  end if;
  return new;
end
$$;

create trigger admin_cap_trigger
before insert or update on public.user_roles
for each row execute function public.assert_admin_cap();

create policy "Users can view own role"
on public.user_roles for select to authenticated
using (user_id = auth.uid());

create policy "Admins can view all roles"
on public.user_roles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can assign roles"
on public.user_roles for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can revoke roles"
on public.user_roles for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Anyone can view approved agents"
on public.profiles for select to anon, authenticated
using (approved = true);

create policy "Owners can view own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

create policy "Admins can view all profiles"
on public.profiles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Users can create own profile on signup"
on public.profiles for insert to authenticated
with check (id = auth.uid());

create policy "Agents can add other agents"
on public.profiles for insert to authenticated
with check (added_by = auth.uid() and id <> auth.uid());

create policy "Owners can update own profile"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Admins can update any profile"
on public.profiles for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can remove agents"
on public.profiles for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Anyone can view skills"
on public.skills for select to anon, authenticated
using (true);

create policy "Agents can upload skills"
on public.skills for insert to authenticated
with check (created_by = auth.uid());

create policy "Creators can update skills"
on public.skills for update to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "Creators can delete skills"
on public.skills for delete to authenticated
using (created_by = auth.uid());

create policy "Admins can update skills"
on public.skills for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete skills"
on public.skills for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Anyone can view agent skills"
on public.agent_skills for select to anon, authenticated
using (true);

create policy "Agents can add own skills"
on public.agent_skills for insert to authenticated
with check (agent_id = auth.uid());

create policy "Agents can update own skills"
on public.agent_skills for update to authenticated
using (agent_id = auth.uid())
with check (agent_id = auth.uid());

create policy "Agents can delete own skills"
on public.agent_skills for delete to authenticated
using (agent_id = auth.uid());

create policy "Anyone can view projects"
on public.projects for select to anon, authenticated
using (true);

create policy "Agents can add own projects"
on public.projects for insert to authenticated
with check (agent_id = auth.uid());

create policy "Agents can update own projects"
on public.projects for update to authenticated
using (agent_id = auth.uid())
with check (agent_id = auth.uid());

create policy "Agents can delete own projects"
on public.projects for delete to authenticated
using (agent_id = auth.uid());

create policy "Admins can remove any project"
on public.projects for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Anyone can view contact methods"
on public.contact_methods for select to anon, authenticated
using (true);

create policy "Agents can add own contact methods"
on public.contact_methods for insert to authenticated
with check (agent_id = auth.uid());

create policy "Agents can update own contact methods"
on public.contact_methods for update to authenticated
using (agent_id = auth.uid())
with check (agent_id = auth.uid());

create policy "Agents can delete own contact methods"
on public.contact_methods for delete to authenticated
using (agent_id = auth.uid());

create policy "Anyone can view reviews"
on public.reviews for select to anon, authenticated
using (true);

create policy "Anyone can leave a review"
on public.reviews for insert to anon, authenticated
with check (true);

create policy "Page owner can delete own reviews"
on public.reviews for delete to authenticated
using (agent_id = auth.uid());

create policy "Admins can delete any review"
on public.reviews for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Anyone can view published posts"
on public.blog_posts for select to anon, authenticated
using (published = true);

create policy "Authors can view own drafts"
on public.blog_posts for select to authenticated
using (agent_id = auth.uid());

create policy "Agents can write own posts"
on public.blog_posts for insert to authenticated
with check (agent_id = auth.uid());

create policy "Authors can update own posts"
on public.blog_posts for update to authenticated
using (agent_id = auth.uid())
with check (agent_id = auth.uid());

create policy "Authors can delete own posts"
on public.blog_posts for delete to authenticated
using (agent_id = auth.uid());

create policy "Admins can update any post"
on public.blog_posts for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete any post"
on public.blog_posts for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger blog_posts_updated_at before update on public.blog_posts
for each row execute function public.set_updated_at();


create or replace function public.bootstrap_first_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_count int;
  pid text;
begin
  select count(*) into admin_count from public.user_roles where role = 'admin';
  if admin_count = 0 then
    loop
      pid := 'PH-' || upper(substr(md5(random()::text), 1, 4));
      exit when not exists (select 1 from public.profiles where partner_id = pid);
    end loop;
    insert into public.profiles (id, partner_id, full_name, approved)
    values (
      new.id,
      pid,
      coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
      true
    )
    on conflict (id) do update set approved = true;
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    -- Every later signup still gets a (hidden) profile row so their dashboard
    -- works immediately; an admin approves them to make it public.
    loop
      pid := 'PH-' || upper(substr(md5(random()::text), 1, 4));
      exit when not exists (select 1 from public.profiles where partner_id = pid);
    end loop;
    insert into public.profiles (id, partner_id, full_name, approved)
    values (
      new.id,
      pid,
      coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
      false
    )
    on conflict (id) do nothing;
  end if;
  return new;
end
$$;

create trigger on_auth_user_created_bootstrap
after insert on auth.users
for each row execute function public.bootstrap_first_admin();

COMMENT ON FUNCTION public.bootstrap_first_admin() IS 'Fresh-database bootstrap: the first signup gets an approved profile and the admin role. Every later signup gets a hidden profile row (approved = false) that waits in the admin approval queue; invited agents keep the profile row created for them.';
-- Auto-confirm every new account so signup signs users straight in,
-- regardless of the project's "Confirm email" dashboard setting.
create or replace function public.auto_confirm_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end
$$;

create trigger on_auth_user_before_insert_confirm
before insert on auth.users
for each row execute function public.auto_confirm_user();
