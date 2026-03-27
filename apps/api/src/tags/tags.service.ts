import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';

export interface Tag {
  id: string;
  name: string;
}

export interface ArticleWithUser {
  id: string;
  title: string;
  thumbnail_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
}

@Injectable()
export class TagsService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  /** タグ一覧を全件返す */
  async findAll(): Promise<Tag[]> {
    const { data, error } = await this.supabase
      .from('tags')
      .select('id, name')
      .order('name');

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data as Tag[];
  }

  /**
   * タグを作成する。同名タグが既存の場合はそれを返す（冪等）。
   */
  async findOrCreate(name: string): Promise<Tag> {
    // まず既存タグを検索
    const { data: existing, error: selectError } = await this.supabase
      .from('tags')
      .select('id, name')
      .eq('name', name)
      .maybeSingle();

    if (selectError) {
      throw new InternalServerErrorException(selectError.message);
    }

    if (existing) {
      return existing as Tag;
    }

    // 新規作成
    const { data: created, error: insertError } = await this.supabase
      .from('tags')
      .insert({ name })
      .select('id, name')
      .single();

    if (insertError) {
      // 並行リクエストによる unique 違反の場合は再取得
      if (insertError.code === '23505') {
        const { data: retry, error: retryError } = await this.supabase
          .from('tags')
          .select('id, name')
          .eq('name', name)
          .single();

        if (retryError) {
          throw new InternalServerErrorException(retryError.message);
        }
        return retry as Tag;
      }
      throw new InternalServerErrorException(insertError.message);
    }

    return created as Tag;
  }

  /** タグ名で記事一覧を返す（公開済みのみ） */
  async findArticlesByTagName(tagName: string): Promise<ArticleWithUser[]> {
    // tags テーブルからタグIDを取得
    const { data: tag, error: tagError } = await this.supabase
      .from('tags')
      .select('id')
      .eq('name', tagName)
      .maybeSingle();

    if (tagError) {
      throw new InternalServerErrorException(tagError.message);
    }

    if (!tag) {
      return [];
    }

    // article_tags 経由で記事を取得
    const { data, error } = await this.supabase
      .from('article_tags')
      .select(
        `
        articles!inner (
          id,
          title,
          thumbnail_url,
          status,
          created_at,
          updated_at,
          users (
            id,
            display_name,
            avatar_url
          )
        )
      `,
      )
      .eq('tag_id', tag.id)
      .eq('articles.status', 'published');

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    // ネストされた articles を平坦化
    return (data ?? []).map((row: any) => row.articles as ArticleWithUser);
  }
}
