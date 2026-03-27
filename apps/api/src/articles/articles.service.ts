import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  /** 公開済み記事一覧を取得 */
  async findAll() {
    const { data, error } = await this.supabase
      .from('articles')
      .select('id, user_id, title, thumbnail_url, status, created_at, updated_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /** 記事詳細を取得（公開済み or オーナー本人のみ） */
  async findOne(id: string, requestUserId?: string) {
    const { data, error } = await this.supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Article #${id} not found`);
    }

    // 下書きは本人のみ閲覧可
    if (data.status === 'draft' && data.user_id !== requestUserId) {
      throw new NotFoundException(`Article #${id} not found`);
    }

    return data;
  }

  /** 記事を作成 */
  async create(dto: CreateArticleDto, userId: string) {
    const { data, error } = await this.supabase
      .from('articles')
      .insert({
        user_id: userId,
        title: dto.title,
        body: dto.body,
        thumbnail_url: dto.thumbnail_url ?? null,
        status: dto.status ?? 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** 記事を更新（オーナーのみ） */
  async update(id: string, dto: UpdateArticleDto, userId: string) {
    await this.assertOwner(id, userId);

    const { data, error } = await this.supabase
      .from('articles')
      .update({
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.body !== undefined && { body: dto.body }),
        ...(dto.thumbnail_url !== undefined && { thumbnail_url: dto.thumbnail_url }),
        ...(dto.status !== undefined && { status: dto.status }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** 記事を削除（オーナーのみ） */
  async remove(id: string, userId: string) {
    await this.assertOwner(id, userId);

    const { error } = await this.supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Article deleted successfully' };
  }

  /** 公開に切り替え（オーナーのみ） */
  async publish(id: string, userId: string) {
    await this.assertOwner(id, userId);

    const { data, error } = await this.supabase
      .from('articles')
      .update({ status: 'published' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** 下書きに戻す（オーナーのみ） */
  async unpublish(id: string, userId: string) {
    await this.assertOwner(id, userId);

    const { data, error } = await this.supabase
      .from('articles')
      .update({ status: 'draft' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** フォロー中ユーザーの公開記事フィードを取得 */
  async getFeed(userId: string) {
    // フォロー中のユーザーIDを取得
    const { data: follows, error: followsError } = await this.supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (followsError) throw followsError;

    if (!follows || follows.length === 0) {
      return [];
    }

    const followingIds = follows.map((f) => f.following_id);

    const { data, error } = await this.supabase
      .from('articles')
      .select('id, user_id, title, thumbnail_url, status, created_at, updated_at')
      .eq('status', 'published')
      .in('user_id', followingIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /** オーナー確認ヘルパー */
  private async assertOwner(id: string, userId: string) {
    const { data, error } = await this.supabase
      .from('articles')
      .select('user_id')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Article #${id} not found`);
    }

    if (data.user_id !== userId) {
      throw new ForbiddenException('You do not own this article');
    }
  }
}
