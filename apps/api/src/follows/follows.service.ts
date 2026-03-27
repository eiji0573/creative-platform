import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';

@Injectable()
export class FollowsService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  /** フォロー状態・カウントを取得 */
  async getFollowStatus(targetUserId: string, requesterId?: string) {
    const [{ count: followersCount }, { count: followingCount }] =
      await Promise.all([
        this.supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', targetUserId),
        this.supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', targetUserId),
      ]);

    let isFollowing = false;
    if (requesterId) {
      const { data } = await this.supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', requesterId)
        .eq('following_id', targetUserId)
        .maybeSingle();
      isFollowing = !!data;
    }

    return {
      followers_count: followersCount ?? 0,
      following_count: followingCount ?? 0,
      is_following: isFollowing,
    };
  }

  /** フォロワー一覧取得 */
  async getFollowers(userId: string) {
    await this.assertUserExists(userId);

    const { data, error } = await this.supabase
      .from('follows')
      .select('follower_id, created_at, users!follows_follower_id_fkey(id, display_name, avatar_url, bio)')
      .eq('following_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row) => ({ ...(row.users as object), followed_at: row.created_at }));
  }

  /** フォロー中一覧取得 */
  async getFollowing(userId: string) {
    await this.assertUserExists(userId);

    const { data, error } = await this.supabase
      .from('follows')
      .select('following_id, created_at, users!follows_following_id_fkey(id, display_name, avatar_url, bio)')
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row) => ({ ...(row.users as object), followed_at: row.created_at }));
  }

  /** フォローする */
  async follow(targetUserId: string, requesterId: string) {
    if (targetUserId === requesterId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    await this.assertUserExists(targetUserId);

    const { error } = await this.supabase
      .from('follows')
      .insert({ follower_id: requesterId, following_id: targetUserId });

    if (error) {
      if (error.code === '23505') throw new ConflictException('Already following');
      throw error;
    }

    return this.getFollowStatus(targetUserId, requesterId);
  }

  /** フォロー解除 */
  async unfollow(targetUserId: string, requesterId: string) {
    const { error } = await this.supabase
      .from('follows')
      .delete()
      .eq('follower_id', requesterId)
      .eq('following_id', targetUserId);

    if (error) throw error;

    return this.getFollowStatus(targetUserId, requesterId);
  }

  private async assertUserExists(userId: string) {
    const { data } = await this.supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!data) throw new NotFoundException(`User #${userId} not found`);
  }
}
