-- Ministérios: perfis, convites, fórum, escalas (execute no SQL Editor ou via Supabase CLI).

-- ---------------------------------------------------------------------------
-- Perfis
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- ---------------------------------------------------------------------------
-- Ministérios e membros
-- ---------------------------------------------------------------------------
create table if not exists public.ministries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ministry_members (
  ministry_id uuid not null references public.ministries (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'sub_admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (ministry_id, user_id)
);

create index if not exists ministry_members_user on public.ministry_members (user_id);

alter table public.ministries enable row level security;
alter table public.ministry_members enable row level security;

create or replace function public.is_ministry_member(p_ministry_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ministry_members m
    where m.ministry_id = p_ministry_id and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_ministry_admin(p_ministry_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ministry_members m
    where m.ministry_id = p_ministry_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'sub_admin')
  );
$$;

create or replace function public.is_ministry_owner(p_ministry_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.ministry_members m
    where m.ministry_id = p_ministry_id
      and m.user_id = auth.uid()
      and m.role = 'owner'
  );
$$;

create policy "ministries_select_public"
  on public.ministries for select
  using (true);

create policy "ministries_insert_authenticated"
  on public.ministries for insert
  with check (auth.uid() = created_by);

create policy "ministries_update_admin"
  on public.ministries for update
  using (public.is_ministry_admin(id));

-- Permite ler a própria linha (ex.: papel no ministério) mesmo antes de outras checagens em cadeia.
create policy "members_select_visible"
  on public.ministry_members for select
  using (
    user_id = auth.uid()
    or public.is_ministry_member(ministry_id)
  );

-- Sem insert/update/delete direto: trigger + RPCs (SECURITY DEFINER).

create or replace function public.handle_new_ministry_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.ministry_members (ministry_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

drop trigger if exists on_ministry_created_owner on public.ministries;
create trigger on_ministry_created_owner
  after insert on public.ministries
  for each row execute function public.handle_new_ministry_owner();

-- ---------------------------------------------------------------------------
-- Pedidos de entrada
-- ---------------------------------------------------------------------------
create table if not exists public.ministry_join_requests (
  id uuid primary key default gen_random_uuid(),
  ministry_id uuid not null references public.ministries (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ministry_join_one_pending
  on public.ministry_join_requests (ministry_id, user_id)
  where status = 'pending';

create index if not exists ministry_join_ministry on public.ministry_join_requests (ministry_id);

alter table public.ministry_join_requests enable row level security;

create policy "join_select_own_or_admin"
  on public.ministry_join_requests for select
  using (
    user_id = auth.uid()
    or public.is_ministry_admin(ministry_id)
  );

create policy "join_insert_own_pending"
  on public.ministry_join_requests for insert
  with check (
    auth.uid() = user_id
    and status = 'pending'
    and not public.is_ministry_member(ministry_id)
  );

create policy "join_delete_own_pending"
  on public.ministry_join_requests for delete
  using (user_id = auth.uid() and status = 'pending');

create or replace function public.approve_ministry_join_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  select * into r
  from public.ministry_join_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Pedido não encontrado';
  end if;

  if not public.is_ministry_admin(r.ministry_id) then
    raise exception 'Sem permissão';
  end if;

  if r.status <> 'pending' then
    raise exception 'Pedido já foi tratado';
  end if;

  update public.ministry_join_requests
  set status = 'approved', updated_at = now()
  where id = p_request_id;

  insert into public.ministry_members (ministry_id, user_id, role)
  values (r.ministry_id, r.user_id, 'member')
  on conflict (ministry_id, user_id) do nothing;
end;
$$;

create or replace function public.reject_ministry_join_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  select * into r
  from public.ministry_join_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Pedido não encontrado';
  end if;

  if not public.is_ministry_admin(r.ministry_id) then
    raise exception 'Sem permissão';
  end if;

  if r.status <> 'pending' then
    raise exception 'Pedido já foi tratado';
  end if;

  update public.ministry_join_requests
  set status = 'rejected', updated_at = now()
  where id = p_request_id;
end;
$$;

create or replace function public.grant_ministry_member_role(
  p_ministry_id uuid,
  p_user_id uuid,
  p_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count int;
begin
  if not public.is_ministry_owner(p_ministry_id) then
    raise exception 'Apenas o dono pode alterar cargos';
  end if;

  if p_role not in ('member', 'sub_admin') then
    raise exception 'Papel inválido';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'Não é possível alterar o próprio papel assim';
  end if;

  update public.ministry_members
  set role = p_role
  where ministry_id = p_ministry_id and user_id = p_user_id;

  get diagnostics updated_count = row_count;
  if updated_count = 0 then
    raise exception 'Membro não encontrado';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Fórum
-- ---------------------------------------------------------------------------
create table if not exists public.ministry_posts (
  id uuid primary key default gen_random_uuid(),
  ministry_id uuid not null references public.ministries (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  parent_id uuid references public.ministry_posts (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists ministry_posts_ministry_created on public.ministry_posts (ministry_id, created_at desc);
create index if not exists ministry_posts_parent on public.ministry_posts (parent_id);

alter table public.ministry_posts enable row level security;

create or replace function public.validate_ministry_post_parent()
returns trigger
language plpgsql
as $$
declare
  p_ministry uuid;
begin
  if new.parent_id is null then
    return new;
  end if;

  select ministry_id into p_ministry
  from public.ministry_posts
  where id = new.parent_id;

  if not found then
    raise exception 'Post pai inválido';
  end if;

  if p_ministry is distinct from new.ministry_id then
    raise exception 'Post pai de outro ministério';
  end if;

  return new;
end;
$$;

drop trigger if exists tr_validate_post_parent on public.ministry_posts;
create trigger tr_validate_post_parent
  before insert or update on public.ministry_posts
  for each row execute function public.validate_ministry_post_parent();

create policy "posts_select_members"
  on public.ministry_posts for select
  using (public.is_ministry_member(ministry_id));

create policy "posts_insert_members_self_author"
  on public.ministry_posts for insert
  with check (
    public.is_ministry_member(ministry_id)
    and auth.uid() = author_id
    and length(trim(body)) > 0
  );

-- ---------------------------------------------------------------------------
-- Escalas
-- ---------------------------------------------------------------------------
create table if not exists public.ministry_events (
  id uuid primary key default gen_random_uuid(),
  ministry_id uuid not null references public.ministries (id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists ministry_events_ministry_starts on public.ministry_events (ministry_id, starts_at);

create table if not exists public.ministry_event_roles (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.ministry_events (id) on delete cascade,
  title text not null,
  max_slots int not null check (max_slots > 0)
);

create index if not exists ministry_event_roles_event on public.ministry_event_roles (event_id);

create table if not exists public.ministry_event_assignments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.ministry_events (id) on delete cascade,
  role_id uuid not null references public.ministry_event_roles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, user_id),
  unique (role_id, user_id)
);

create index if not exists ministry_assignments_role on public.ministry_event_assignments (role_id);

alter table public.ministry_events enable row level security;
alter table public.ministry_event_roles enable row level security;
alter table public.ministry_event_assignments enable row level security;

create or replace function public.check_assignment_slot()
returns trigger
language plpgsql
as $$
declare
  ev uuid;
  cap int;
  cnt int;
begin
  select r.event_id, r.max_slots into ev, cap
  from public.ministry_event_roles r
  where r.id = new.role_id;

  if not found then
    raise exception 'Cargo inválido';
  end if;

  if new.event_id is distinct from ev then
    raise exception 'Cargo não pertence ao evento';
  end if;

  select count(*)::int into cnt
  from public.ministry_event_assignments
  where role_id = new.role_id;

  if cnt >= cap then
    raise exception 'Vagas esgotadas para este cargo';
  end if;

  return new;
end;
$$;

drop trigger if exists tr_check_assignment_slot on public.ministry_event_assignments;
create trigger tr_check_assignment_slot
  before insert on public.ministry_event_assignments
  for each row execute function public.check_assignment_slot();

create policy "events_select_members"
  on public.ministry_events for select
  using (public.is_ministry_member(ministry_id));

create policy "events_write_admin"
  on public.ministry_events for insert
  with check (
    public.is_ministry_admin(ministry_id)
    and auth.uid() = created_by
  );

create policy "events_update_admin"
  on public.ministry_events for update
  using (public.is_ministry_admin(ministry_id));

create policy "events_delete_admin"
  on public.ministry_events for delete
  using (public.is_ministry_admin(ministry_id));

create policy "event_roles_select_members"
  on public.ministry_event_roles for select
  using (
    exists (
      select 1 from public.ministry_events e
      where e.id = event_id and public.is_ministry_member(e.ministry_id)
    )
  );

create policy "event_roles_write_admin"
  on public.ministry_event_roles for insert
  with check (
    exists (
      select 1 from public.ministry_events e
      where e.id = event_id and public.is_ministry_admin(e.ministry_id)
    )
  );

create policy "event_roles_update_admin"
  on public.ministry_event_roles for update
  using (
    exists (
      select 1 from public.ministry_events e
      where e.id = event_id and public.is_ministry_admin(e.ministry_id)
    )
  );

create policy "event_roles_delete_admin"
  on public.ministry_event_roles for delete
  using (
    exists (
      select 1 from public.ministry_events e
      where e.id = event_id and public.is_ministry_admin(e.ministry_id)
    )
  );

create policy "assignments_select_members"
  on public.ministry_event_assignments for select
  using (
    exists (
      select 1 from public.ministry_events e
      where e.id = event_id and public.is_ministry_member(e.ministry_id)
    )
  );

create policy "assignments_insert_self_member"
  on public.ministry_event_assignments for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.ministry_events e
      where e.id = event_id and public.is_ministry_member(e.ministry_id)
    )
  );

create policy "assignments_delete_self_or_admin"
  on public.ministry_event_assignments for delete
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.ministry_events e
      where e.id = event_id and public.is_ministry_admin(e.ministry_id)
    )
  );

grant usage on schema public to anon, authenticated;
grant select on public.ministries to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.ministries to authenticated;
grant select on public.ministry_members to authenticated;
grant select, insert, delete on public.ministry_join_requests to authenticated;
grant select, insert on public.ministry_posts to authenticated;
grant select, insert, update, delete on public.ministry_events to authenticated;
grant select, insert, update, delete on public.ministry_event_roles to authenticated;
grant select, insert, delete on public.ministry_event_assignments to authenticated;

grant execute on function public.approve_ministry_join_request(uuid) to authenticated;
grant execute on function public.reject_ministry_join_request(uuid) to authenticated;
grant execute on function public.grant_ministry_member_role(uuid, uuid, text) to authenticated;

-- Usuários já existentes antes da migração
insert into public.profiles (id, display_name)
select id, coalesce(raw_user_meta_data->>'display_name', split_part(email, '@', 1))
from auth.users
on conflict (id) do nothing;
