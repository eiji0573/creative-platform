import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';

@Controller('articles/:articleId/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  /**
   * GET /api/articles/:articleId/likes
   * いいね数と自分がいいねしているかを取得（認証任意）
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  getLikes(
    @Param('articleId') articleId: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.likesService.getLikes(articleId, user?.userId);
  }

  /**
   * POST /api/articles/:articleId/likes
   * いいねする（要認証）
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  like(
    @Param('articleId') articleId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.likesService.like(articleId, user.userId);
  }

  /**
   * DELETE /api/articles/:articleId/likes
   * いいね解除（要認証）
   */
  @UseGuards(JwtAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.OK)
  unlike(
    @Param('articleId') articleId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.likesService.unlike(articleId, user.userId);
  }
}
