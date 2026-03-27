-- ============================================================
-- Phase 1 テーブル全件マイグレーション
-- SETUP-03: created by Claude-A
-- ============================================================

-- ----------------------------------------
-- users（Supabase Auth と連携）
-- ----------------------------------------
create table if not exists public.users (
  id          uuid        primary key references auth.users(id) on delete cascade,
  display_name text        not null default '',
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now()
);

alter table public.users enable row level security;

-- ユーザーは自分のプロフィールを読める。全員が他ユーザーを読める
create policy "users: anyone can read"
  on public.users for select using (true);

create policy "users: owner can update"
  on public.users for update using (auth.uid() = id);

-- auth.users に新規登録されたら自動で public.users を作成するトリガー
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------
-- tags
-- ----------------------------------------
create table if not exists public.tags (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

alter table public.tags enable row level security;

create policy "tags: anyone can read"
  on public.tags for select using (true);

create policy "tags: authenticated can insert"
  on public.tags for insert with check (auth.role() = 'authenticated');

-- ----------------------------------------
-- articles
-- ----------------------------------------
create type public.article_status as enum ('draft', 'published');

create table if not exists public.articles (
  id             uuid                 primary key default gen_random_uuid(),
  user_id        uuid                 not null references public.users(id) on delete cascade,
  title          text                 not null,
  body           text                 not null default '',
  thumbnail_url  text,
  status         public.article_status not null default 'draft',
  created_at     timestamptz          not null default now(),
  updated_at     timestamptz          not null default now()
);

alter table public.articles enable row level security;

create policy "articles: published are public"
  on public.articles for select
  using (status = 'published' or auth.uid() = user_id);

create policy "articles: owner can insert"
  on public.articles for insert with check (auth.uid() = user_id);

create policy "articles: owner can update"
  on public.articles for update using (auth.uid() = user_id);

create policy "articles: owner can delete"
  on public.articles for delete using (auth.uid() = user_id);

-- updated_at を自動更新するトリガー
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger articles_set_updated_at
  before update on public.articles
  for each row execute procedure public.set_updated_at();

-- ----------------------------------------
-- article_tags（多対多）
-- ----------------------------------------
create table if not exists public.article_tags (
  article_id uuid not null references public.articles(id) on delete cascade,
  tag_id     uuid not null references public.tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

alter table public.article_tags enable row level security;

create policy "article_tags: anyone can read"
  on public.article_tags for select using (true);

create policy "article_tags: owner can manage"
  on public.article_tags for all
  using (
    auth.uid() = (select user_id from public.articles where id = article_id)
  );

-- ----------------------------------------
-- インデックス
-- ----------------------------------------
create index if not exists articles_user_id_idx  on public.articles(user_id);
create index if not exists articles_status_idx   on public.articles(status);
create index if not exists articles_created_idx  on public.articles(created_at desc);
create index if not exists article_tags_tag_idx  on public.article_tags(tag_id);
