import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  /** GET /api/organizations — 全組織一覧（認証不要） */
  @Get()
  findAll() {
    return this.organizationsService.findAll();
  }

  /** GET /api/organizations/users/:userId — ユーザーの所属組織（認証不要） */
  @Get('users/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.organizationsService.findByUser(userId);
  }

  /** GET /api/organizations/:id — 組織詳細（認証不要） */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  /** POST /api/organizations — 組織作成（要認証） */
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.organizationsService.create(dto, user.userId);
  }

  /** POST /api/organizations/:id/members — メンバー追加（ownerのみ） */
  @UseGuards(JwtAuthGuard)
  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  addMember(
    @Param('id') id: string,
    @Body('user_id') targetUserId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.organizationsService.addMember(id, targetUserId, user.userId);
  }

  /** DELETE /api/organizations/:id/members/:userId — メンバー削除（ownerのみ） */
  @UseGuards(JwtAuthGuard)
  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.OK)
  removeMember(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.organizationsService.removeMember(id, targetUserId, user.userId);
  }

  /** DELETE /api/organizations/:id — 組織削除（ownerのみ） */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.organizationsService.remove(id, user.userId);
  }
}
