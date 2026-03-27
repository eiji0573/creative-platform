import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;
}

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  /** GET /tags — タグ一覧（全件） */
  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  /** POST /tags — タグ作成（重複は既存を返す） */
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.findOrCreate(dto.name.trim());
  }

  /** GET /tags/:name/articles — タグ別記事一覧 */
  @Get(':name/articles')
  findArticlesByTag(@Param('name') name: string) {
    return this.tagsService.findArticlesByTagName(name);
  }
}
