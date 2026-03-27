-- ============================================================
-- Phase 2 フォロー/フォロワー機能
-- P2-03: created by ClaudeCode-4
-- ============================================================

-- ----------------------------------------
-- follows
-- ----------------------------------------
create table if not exists public.follows (
  follower_id  uuid        not null references public.users(id) on delete cascade,
  following_id uuid        not null references public.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self_follow check (follower_id != following_id)
);

alter table public.follows enable row level security;

create policy "follows: anyone can read"
  on public.follows for select using (true);

create policy "follows: authenticated can insert"
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "follows: owner can delete"
  on public.follows for delete using (auth.uid() = follower_id);

-- ----------------------------------------
-- インデックス
-- ----------------------------------------
create index if not exists follows_follower_id_idx  on public.follows(follower_id);
create index if not exists follows_following_id_idx on public.follows(following_id);
