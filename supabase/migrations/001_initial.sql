-- Execute no SQL Editor do Supabase (ou via CLI).
-- Habilita progresso do terço/rosário e leitura bíblica por usuário.

create table if not exists public.rosary_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('daily', 'full')),
  payload jsonb not null default '{"checkedIds":[]}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, mode)
);

create table if not exists public.bible_reading_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  day_index int not null check (day_index >= 1 and day_index <= 365),
  completed_at timestamptz not null default now(),
  notes text,
  primary key (user_id, day_index)
);

alter table public.rosary_progress enable row level security;
alter table public.bible_reading_progress enable row level security;

create policy "rosary_select_own"
  on public.rosary_progress for select
  using (auth.uid() = user_id);

create policy "rosary_insert_own"
  on public.rosary_progress for insert
  with check (auth.uid() = user_id);

create policy "rosary_update_own"
  on public.rosary_progress for update
  using (auth.uid() = user_id);

create policy "bible_select_own"
  on public.bible_reading_progress for select
  using (auth.uid() = user_id);

create policy "bible_insert_own"
  on public.bible_reading_progress for insert
  with check (auth.uid() = user_id);

create policy "bible_update_own"
  on public.bible_reading_progress for update
  using (auth.uid() = user_id);

create policy "bible_delete_own"
  on public.bible_reading_progress for delete
  using (auth.uid() = user_id);

create index if not exists bible_progress_user_day on public.bible_reading_progress (user_id, day_index);
