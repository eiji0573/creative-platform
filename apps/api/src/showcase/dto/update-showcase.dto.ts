import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateShowcaseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  image_url?: string;
}
