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
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('users/:userId')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  /**
   * GET /users/:userId/follow-status
   * フォロー状態・カウント取得（認証任意）
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Get('follow-status')
  getFollowStatus(
    @Param('userId') userId: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.followsService.getFollowStatus(userId, user?.userId);
  }

  /**
   * GET /users/:userId/followers
   * フォロワー一覧（認証不要）
   */
  @Get('followers')
  getFollowers(@Param('userId') userId: string) {
    return this.followsService.getFollowers(userId);
  }

  /**
   * GET /users/:userId/following
   * フォロー中一覧（認証不要）
   */
  @Get('following')
  getFollowing(@Param('userId') userId: string) {
    return this.followsService.getFollowing(userId);
  }

  /**
   * POST /users/:userId/follow
   * フォローする（要認証）
   */
  @UseGuards(JwtAuthGuard)
  @Post('follow')
  @HttpCode(HttpStatus.CREATED)
  follow(
    @Param('userId') userId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.followsService.follow(userId, user.userId);
  }

  /**
   * DELETE /users/:userId/follow
   * フォロー解除（要認証）
   */
  @UseGuards(JwtAuthGuard)
  @Delete('follow')
  @HttpCode(HttpStatus.OK)
  unfollow(
    @Param('userId') userId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.followsService.unfollow(userId, user.userId);
  }
}
