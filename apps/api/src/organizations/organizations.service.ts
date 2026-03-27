import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  /** 全組織一覧 */
  async findAll() {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('id, name, description, avatar_url, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /** 組織詳細（メンバー一覧含む） */
  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Organization #${id} not found`);
    }

    const { data: members, error: membersError } = await this.supabase
      .from('organization_members')
      .select('user_id, role, joined_at')
      .eq('organization_id', id);

    if (membersError) throw membersError;

    return { ...data, members: members ?? [] };
  }

  /** ユーザーが所属する組織一覧 */
  async findByUser(userId: string) {
    const { data, error } = await this.supabase
      .from('organization_members')
      .select('role, joined_at, organizations(id, name, description, avatar_url, created_at)')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  /** 組織を作成（作成者はownerになる） */
  async create(dto: CreateOrganizationDto, userId: string) {
    const { data: org, error: orgError } = await this.supabase
      .from('organizations')
      .insert({
        name: dto.name,
        description: dto.description ?? null,
        avatar_url: dto.avatar_url ?? null,
      })
      .select()
      .single();

    if (orgError) throw orgError;

    const { error: memberError } = await this.supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: userId,
        role: 'owner',
      });

    if (memberError) throw memberError;

    return org;
  }

  /** メンバーを追加（ownerのみ） */
  async addMember(orgId: string, targetUserId: string, requestUserId: string) {
    await this.assertOwner(orgId, requestUserId);

    const { data, error } = await this.supabase
      .from('organization_members')
      .insert({
        organization_id: orgId,
        user_id: targetUserId,
        role: 'member',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** メンバーを削除（ownerのみ） */
  async removeMember(orgId: string, targetUserId: string, requestUserId: string) {
    await this.assertOwner(orgId, requestUserId);

    const { error } = await this.supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', orgId)
      .eq('user_id', targetUserId);

    if (error) throw error;
    return { message: 'Member removed successfully' };
  }

  /** 組織を削除（ownerのみ） */
  async remove(id: string, userId: string) {
    await this.assertOwner(id, userId);

    const { error } = await this.supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Organization deleted successfully' };
  }

  /** owner確認ヘルパー */
  private async assertOwner(orgId: string, userId: string) {
    const { data, error } = await this.supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Organization #${orgId} not found or you are not a member`);
    }

    if (data.role !== 'owner') {
      throw new ForbiddenException('Only owners can perform this action');
    }
  }
}
