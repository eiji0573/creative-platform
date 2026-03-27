-- ============================================================
-- Phase 2 コメント機能マイグレーション
-- P2-02: created by ClaudeCode-2
-- ============================================================

create table if not exists public.comments (
  id         uuid        primary key default gen_random_uuid(),
  article_id uuid        not null references public.articles(id) on delete cascade,
  user_id    uuid        not null references public.users(id) on delete cascade,
  body       text        not null,
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "comments: anyone can read"
  on public.comments for select using (true);

create policy "comments: authenticated can insert"
  on public.comments for insert with check (auth.uid() = user_id);

create policy "comments: owner can delete"
  on public.comments for delete using (auth.uid() = user_id);

create index if not exists comments_article_id_idx on public.comments(article_id);
create index if not exists comments_created_idx    on public.comments(created_at);
