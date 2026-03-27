import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';
import { CreateSeriesDto } from './dto/create-series.dto';
import { AddArticleDto } from './dto/add-article.dto';

@Injectable()
export class SeriesService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  /** 全シリーズ一覧を取得 */
  async findAll() {
    const { data, error } = await this.supabase
      .from('series')
      .select('id, user_id, title, description, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /** 特定ユーザーのシリーズ一覧を取得 */
  async findByUser(userId: string) {
    const { data, error } = await this.supabase
      .from('series')
      .select('id, user_id, title, description, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /** シリーズ詳細を取得（記事一覧含む） */
  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('series')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Series #${id} not found`);
    }

    const { data: articles, error: articlesError } = await this.supabase
      .from('series_articles')
      .select('position, articles(id, title, created_at, user_id)')
      .eq('series_id', id)
      .order('position', { ascending: true });

    if (articlesError) throw articlesError;

    return { ...data, articles: articles ?? [] };
  }

  /** シリーズを作成 */
  async create(dto: CreateSeriesDto, userId: string) {
    const { data, error } = await this.supabase
      .from('series')
      .insert({
        user_id: userId,
        title: dto.title,
        description: dto.description ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** シリーズに記事を追加（オーナーのみ） */
  async addArticle(seriesId: string, dto: AddArticleDto, userId: string) {
    await this.assertOwner(seriesId, userId);

    const { data, error } = await this.supabase
      .from('series_articles')
      .insert({
        series_id: seriesId,
        article_id: dto.article_id,
        position: dto.position,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** シリーズから記事を削除（オーナーのみ） */
  async removeArticle(seriesId: string, articleId: string, userId: string) {
    await this.assertOwner(seriesId, userId);

    const { error } = await this.supabase
      .from('series_articles')
      .delete()
      .eq('series_id', seriesId)
      .eq('article_id', articleId);

    if (error) throw error;
    return { message: 'Article removed from series successfully' };
  }

  /** シリーズを削除（オーナーのみ） */
  async remove(id: string, userId: string) {
    await this.assertOwner(id, userId);

    const { error } = await this.supabase
      .from('series')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Series deleted successfully' };
  }

  /** オーナー確認ヘルパー */
  private async assertOwner(id: string, userId: string) {
    const { data, error } = await this.supabase
      .from('series')
      .select('user_id')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Series #${id} not found`);
    }

    if (data.user_id !== userId) {
      throw new ForbiddenException('You do not own this series');
    }
  }
}
