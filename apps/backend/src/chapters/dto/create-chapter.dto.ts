import { IsString, IsOptional, IsBoolean, IsInt, Min, MinLength, IsArray } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  chapterNumber?: number;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateChapterDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class ReorderChaptersDto {
  @IsArray()
  chapterIds: string[];
}
