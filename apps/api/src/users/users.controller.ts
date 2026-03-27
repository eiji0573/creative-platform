import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/:id
   * ユーザープロフィールを取得（認証不要）
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  /**
   * PATCH /users/:id
   * ユーザープロフィールを更新（要認証・本人のみ）
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.usersService.update(id, user.userId, dto);
  }

  /**
   * GET /users/:id/articles
   * ユーザーの公開記事一覧を取得（認証不要）
   */
  @Get(':id/articles')
  findArticles(@Param('id') id: string) {
    return this.usersService.findArticlesByUserId(id);
  }
}
