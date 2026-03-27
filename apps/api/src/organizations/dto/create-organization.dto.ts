import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  avatar_url?: string;
}
