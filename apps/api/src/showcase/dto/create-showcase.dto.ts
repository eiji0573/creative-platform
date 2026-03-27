import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateShowcaseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsNotEmpty()
  image_url: string;
}
