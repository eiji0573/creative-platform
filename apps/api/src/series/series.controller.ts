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
import { SeriesService } from './series.service';
import { CreateSeriesDto } from './dto/create-series.dto';
import { AddArticleDto } from './dto/add-article.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  /**
   * GET /api/series
   * 全シリーズ一覧（認証不要）
   */
  @Get()
  findAll() {
    return this.seriesService.findAll();
  }

  /**
   * GET /api/series/users/:userId
   * ユーザーのシリーズ一覧（認証不要）
   */
  @Get('users/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.seriesService.findByUser(userId);
  }

  /**
   * GET /api/series/:id
   * シリーズ詳細（記事一覧含む、認証不要）
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seriesService.findOne(id);
  }

  /**
   * POST /api/series
   * シリーズ作成（要認証）
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateSeriesDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.seriesService.create(dto, user.userId);
  }

  /**
   * POST /api/series/:id/articles
   * 記事追加（オーナーのみ）
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/articles')
  @HttpCode(HttpStatus.CREATED)
  addArticle(
    @Param('id') id: string,
    @Body() dto: AddArticleDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.seriesService.addArticle(id, dto, user.userId);
  }

  /**
   * DELETE /api/series/:id/articles/:articleId
   * 記事削除（オーナーのみ）
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id/articles/:articleId')
  @HttpCode(HttpStatus.OK)
  removeArticle(
    @Param('id') id: string,
    @Param('articleId') articleId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.seriesService.removeArticle(id, articleId, user.userId);
  }

  /**
   * DELETE /api/series/:id
   * シリーズ削除（オーナーのみ）
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.seriesService.remove(id, user.userId);
  }
}
