import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';

@Injectable()
export class LikesService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  /** 記事のいいね情報を取得（件数 + 自分がいいねしているか） */
  async getLikes(articleId: string, userId?: string) {
    const { count, error } = await this.supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', articleId);

    if (error) throw error;

    let liked = false;
    if (userId) {
      const { data } = await this.supabase
        .from('likes')
        .select('user_id')
        .eq('article_id', articleId)
        .eq('user_id', userId)
        .maybeSingle();
      liked = !!data;
    }

    return { count: count ?? 0, liked };
  }

  /** いいねする */
  async like(articleId: string, userId: string) {
    // 記事の存在確認
    const { data: article } = await this.supabase
      .from('articles')
      .select('id')
      .eq('id', articleId)
      .maybeSingle();

    if (!article) throw new NotFoundException(`Article #${articleId} not found`);

    const { error } = await this.supabase
      .from('likes')
      .insert({ user_id: userId, article_id: articleId });

    if (error) {
      // unique制約違反 = すでにいいね済み
      if (error.code === '23505') throw new ConflictException('Already liked');
      throw error;
    }

    return this.getLikes(articleId, userId);
  }

  /** いいね解除 */
  async unlike(articleId: string, userId: string) {
    const { error } = await this.supabase
      .from('likes')
      .delete()
      .eq('article_id', articleId)
      .eq('user_id', userId);

    if (error) throw error;

    return this.getLikes(articleId, userId);
  }
}
