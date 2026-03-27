import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSeriesDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}
