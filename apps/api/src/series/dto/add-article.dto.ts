import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class AddArticleDto {
  @IsString()
  @IsNotEmpty()
  article_id: string;

  @IsInt()
  @Min(1)
  position: number;
}
