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
import { ImageCommentsService } from './image-comments.service';
import { CreateImageCommentDto } from './dto/create-image-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('showcase/:workId/image-comments')
export class ImageCommentsController {
  constructor(private readonly imageCommentsService: ImageCommentsService) {}

  /**
   * GET /api/showcase/:workId/image-comments
   * 作品の画像コメント一覧（認証不要）
   */
  @Get()
  findAll(@Param('workId') workId: string) {
    return this.imageCommentsService.findByWork(workId);
  }

  /**
   * POST /api/showcase/:workId/image-comments
   * 画像コメントを投稿（要認証）
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('workId') workId: string,
    @Body() dto: CreateImageCommentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.imageCommentsService.create(workId, dto, user.userId);
  }

  /**
   * DELETE /api/showcase/:workId/image-comments/:commentId
   * 画像コメントを削除（投稿者本人のみ）
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('commentId') commentId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.imageCommentsService.remove(commentId, user.userId);
  }
}
