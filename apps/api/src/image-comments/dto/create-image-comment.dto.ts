import { IsString, IsNumber, MinLength, MaxLength, Min, Max } from 'class-validator';

export class CreateImageCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  body: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  pos_x: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  pos_y: number;
}
