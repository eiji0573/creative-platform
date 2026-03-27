import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  /** 記事のコメント一覧を取得（投稿者情報付き） */
  async findByArticle(articleId: string) {
    const { data, error } = await this.supabase
      .from('comments')
      .select('id, body, created_at, user_id, users(display_name, avatar_url)')
      .eq('article_id', articleId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  /** コメントを作成 */
  async create(articleId: string, dto: CreateCommentDto, userId: string) {
    const { data, error } = await this.supabase
      .from('comments')
      .insert({ article_id: articleId, user_id: userId, body: dto.body })
      .select('id, body, created_at, user_id, users(display_name, avatar_url)')
      .single();

    if (error) throw error;
    return data;
  }

  /** コメントを削除（オーナーのみ） */
  async remove(commentId: string, userId: string) {
    const { data, error } = await this.supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Comment #${commentId} not found`);
    }

    if (data.user_id !== userId) {
      throw new ForbiddenException('You do not own this comment');
    }

    const { error: deleteError } = await this.supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) throw deleteError;
    return { message: 'Comment deleted successfully' };
  }
}
