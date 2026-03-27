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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('articles/:articleId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * GET /api/articles/:articleId/comments
   * 記事のコメント一覧（認証不要）
   */
  @Get()
  findAll(@Param('articleId') articleId: string) {
    return this.commentsService.findByArticle(articleId);
  }

  /**
   * POST /api/articles/:articleId/comments
   * コメントを投稿（要認証）
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('articleId') articleId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.commentsService.create(articleId, dto, user.userId);
  }

  /**
   * DELETE /api/articles/:articleId/comments/:commentId
   * コメントを削除（オーナーのみ）
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('commentId') commentId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.commentsService.remove(commentId, user.userId);
  }
}
