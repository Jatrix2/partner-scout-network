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

COMMENT ON FUNCTION public.bootstrap_first_admin() IS 'Fresh-database bootstrap: the first signup gets an approved profile and the admin role. Every later signup gets a hidden profile row (approved = false) that waits in the admin approval queue; invited agents keep the profile row created for them.';