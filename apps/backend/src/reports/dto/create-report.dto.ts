import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @MaxLength(100)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  comicId?: string;

  @IsOptional()
  @IsString()
  chapterId?: string;
}
