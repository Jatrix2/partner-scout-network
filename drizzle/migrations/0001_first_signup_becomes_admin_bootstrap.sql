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
  if admin_count > 0 then
    return new;
  end if;
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
  return new;
end
$$;

create trigger on_auth_user_created_bootstrap
after insert on auth.users
for each row execute function public.bootstrap_first_admin();

COMMENT ON FUNCTION public.bootstrap_first_admin() IS 'Fresh-database bootstrap: when no admin exists yet, the first signup gets an approved profile and the admin role. Subsequent signups go through the normal approval queue.';