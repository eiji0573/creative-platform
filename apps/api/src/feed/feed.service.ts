import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';

@Injectable()
export class FeedService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  /** フォロー中ユーザーの公開済み記事フィードを取得 */
  async getFeed(userId: string) {
    // フォロー中のユーザーID一覧を取得
    const { data: follows, error: followError } = await this.supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (followError) throw followError;
    if (!follows || follows.length === 0) return [];

    const followingIds = follows.map((f) => f.following_id);

    // フォロー中ユーザーの公開済み記事を取得（投稿者情報付き）
    const { data, error } = await this.supabase
      .from('articles')
      .select('id, title, thumbnail_url, created_at, user_id, users(id, display_name, avatar_url)')
      .eq('status', 'published')
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  }
}
