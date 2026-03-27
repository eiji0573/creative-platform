import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async findById(id: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, display_name, avatar_url, bio, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return data;
  }

  async update(id: string, requesterId: string, dto: UpdateUserDto) {
    if (id !== requesterId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const updatePayload: Record<string, unknown> = {};
    if (dto.display_name !== undefined) updatePayload.display_name = dto.display_name;
    if (dto.avatar_url !== undefined) updatePayload.avatar_url = dto.avatar_url;
    if (dto.bio !== undefined) updatePayload.bio = dto.bio;

    const { data, error } = await this.supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', id)
      .select('id, display_name, avatar_url, bio, created_at, updated_at')
      .single();

    if (error || !data) {
      throw new NotFoundException(`User with id "${id}" not found or update failed`);
    }

    return data;
  }

  async findArticlesByUserId(userId: string) {
    // Verify user exists first
    await this.findById(userId);

    const { data, error } = await this.supabase
      .from('articles')
      .select(
        'id, title, slug, excerpt, cover_image_url, status, published_at, created_at, updated_at, author_id',
      )
      .eq('author_id', userId)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch articles: ${error.message}`);
    }

    return data ?? [];
  }
}
