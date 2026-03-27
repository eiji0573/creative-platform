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
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
// TODO: JwtAuthGuard は BE-01（認証API）完成後に有効化する
// import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
// import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  /**
   * GET /api/articles
   * 公開済み記事一覧を取得（認証不要）
   */
  @Get()
  findAll() {
    return this.articlesService.findAll();
  }

  /**
   * GET /api/articles/:id
   * 記事詳細を取得
   * - 公開済み記事は誰でも閲覧可能
   * - 下書き記事はオーナーのみ閲覧可能
   * TODO: OptionalJwtAuthGuard を BE-01 完成後に追加して、認証済みユーザーに下書きを見せる
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    // requestUserId は現在未認証のため undefined を渡す
    // BE-01 完成後は @CurrentUser() から取得する
    return this.articlesService.findOne(id, undefined);
  }

  /**
   * POST /api/articles
   * 記事を作成（要認証）
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateArticleDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.articlesService.create(dto, user.userId);
  }

  /**
   * PATCH /api/articles/:id
   * 記事を更新（オーナーのみ）
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.articlesService.update(id, dto, user.userId);
  }

  /**
   * DELETE /api/articles/:id
   * 記事を削除（オーナーのみ）
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.articlesService.remove(id, user.userId);
  }

  /**
   * PATCH /api/articles/:id/publish
   * 記事を公開に切り替え（オーナーのみ）
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/publish')
  publish(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.articlesService.publish(id, user.userId);
  }

  /**
   * PATCH /api/articles/:id/unpublish
   * 記事を下書きに戻す（オーナーのみ）
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/unpublish')
  unpublish(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.articlesService.unpublish(id, user.userId);
  }
}
