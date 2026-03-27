import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ShowcaseService } from './showcase.service';
import { CreateShowcaseDto } from './dto/create-showcase.dto';
import { UpdateShowcaseDto } from './dto/update-showcase.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('showcase')
export class ShowcaseController {
  constructor(private readonly showcaseService: ShowcaseService) {}

  /**
   * GET /api/showcase
   * 全作品一覧（認証不要）
   */
  @Get()
  findAll() {
    return this.showcaseService.findAll();
  }

  /**
   * GET /api/showcase/users/:userId
   * ユーザーのポートフォリオ一覧（認証不要）
   */
  @Get('users/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.showcaseService.findByUser(userId);
  }

  /**
   * GET /api/showcase/:id
   * 作品詳細（認証不要）
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.showcaseService.findOne(id);
  }

  /**
   * POST /api/showcase
   * 作品投稿（要認証）
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateShowcaseDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.showcaseService.create(dto, user.userId);
  }

  /**
   * PATCH /api/showcase/:id
   * 作品更新（オーナーのみ）
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateShowcaseDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.showcaseService.update(id, dto, user.userId);
  }

  /**
   * DELETE /api/showcase/:id
   * 作品削除（オーナーのみ）
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.showcaseService.remove(id, user.userId);
  }
}
