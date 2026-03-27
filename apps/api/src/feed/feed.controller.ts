import { Controller, Get, UseGuards } from '@nestjs/common';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  /**
   * GET /api/feed
   * フォロー中ユーザーの公開済み記事フィード（要認証）
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  getFeed(@CurrentUser() user: CurrentUserPayload) {
    return this.feedService.getFeed(user.userId);
  }
}
