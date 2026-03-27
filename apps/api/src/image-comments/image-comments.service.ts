import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';
import { CreateImageCommentDto } from './dto/create-image-comment.dto';

@Injectable()
export class ImageCommentsService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  /** 作品の画像コメント一覧を取得（投稿者情報付き） */
  async findByWork(workId: string) {
    const { data, error } = await this.supabase
      .from('image_comments')
      .select('id, body, pos_x, pos_y, created_at, user_id, users(display_name, avatar_url)')
      .eq('work_id', workId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  /** 画像コメントを作成 */
  async create(workId: string, dto: CreateImageCommentDto, userId: string) {
    // work 存在確認
    const { data: work, error: workError } = await this.supabase
      .from('showcase_works')
      .select('id')
      .eq('id', workId)
      .single();

    if (workError || !work) {
      throw new NotFoundException(`Showcase work #${workId} not found`);
    }

    const { data, error } = await this.supabase
      .from('image_comments')
      .insert({
        work_id: workId,
        user_id: userId,
        body: dto.body,
        pos_x: dto.pos_x,
        pos_y: dto.pos_y,
      })
      .select('id, body, pos_x, pos_y, created_at, user_id, users(display_name, avatar_url)')
      .single();

    if (error) throw error;
    return data;
  }

  /** 画像コメントを削除（投稿者本人のみ） */
  async remove(commentId: string, userId: string) {
    const { data, error } = await this.supabase
      .from('image_comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Image comment #${commentId} not found`);
    }

    if (data.user_id !== userId) {
      throw new ForbiddenException('You do not own this comment');
    }

    const { error: deleteError } = await this.supabase
      .from('image_comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) throw deleteError;
    return { message: 'Image comment deleted successfully' };
  }
}
