-- ============================================================
-- Phase 2 いいね機能
-- P2-01: created by ClaudeCode-1
-- ============================================================

-- ----------------------------------------
-- likes
-- ----------------------------------------
create table if not exists public.likes (
  user_id    uuid        not null references public.users(id) on delete cascade,
  article_id uuid        not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

alter table public.likes enable row level security;

create policy "likes: anyone can read"
  on public.likes for select using (true);

create policy "likes: authenticated can insert"
  on public.likes for insert with check (auth.uid() = user_id);

create policy "likes: owner can delete"
  on public.likes for delete using (auth.uid() = user_id);

-- ----------------------------------------
-- インデックス
-- ----------------------------------------
create index if not exists likes_article_id_idx on public.likes(article_id);
create index if not exists likes_user_id_idx    on public.likes(user_id);
