import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';
import { CreateShowcaseDto } from './dto/create-showcase.dto';
import { UpdateShowcaseDto } from './dto/update-showcase.dto';

@Injectable()
export class ShowcaseService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  /** 全公開作品一覧を取得 */
  async findAll() {
    const { data, error } = await this.supabase
      .from('showcase_works')
      .select('id, user_id, title, description, image_url, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /** 特定ユーザーの作品一覧を取得 */
  async findByUser(userId: string) {
    const { data, error } = await this.supabase
      .from('showcase_works')
      .select('id, user_id, title, description, image_url, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /** 作品詳細を取得 */
  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('showcase_works')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Showcase work #${id} not found`);
    }

    return data;
  }

  /** 作品を投稿 */
  async create(dto: CreateShowcaseDto, userId: string) {
    const { data, error } = await this.supabase
      .from('showcase_works')
      .insert({
        user_id: userId,
        title: dto.title,
        description: dto.description ?? null,
        image_url: dto.image_url,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** 作品を更新（オーナーのみ） */
  async update(id: string, dto: UpdateShowcaseDto, userId: string) {
    await this.assertOwner(id, userId);

    const { data, error } = await this.supabase
      .from('showcase_works')
      .update({
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.image_url !== undefined && { image_url: dto.image_url }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** 作品を削除（オーナーのみ） */
  async remove(id: string, userId: string) {
    await this.assertOwner(id, userId);

    const { error } = await this.supabase
      .from('showcase_works')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Showcase work deleted successfully' };
  }

  /** オーナー確認ヘルパー */
  private async assertOwner(id: string, userId: string) {
    const { data, error } = await this.supabase
      .from('showcase_works')
      .select('user_id')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Showcase work #${id} not found`);
    }

    if (data.user_id !== userId) {
      throw new ForbiddenException('You do not own this showcase work');
    }
  }
}
