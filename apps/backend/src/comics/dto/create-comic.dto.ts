import { IsString, IsOptional, IsEnum, MaxLength, MinLength, IsArray } from 'class-validator';
import { ComicStatus } from '@prisma/client';

export class CreateComicDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  artistId?: string;

  @IsOptional()
  @IsEnum(ComicStatus)
  status?: ComicStatus;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ageRating?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genreIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}

export class UpdateComicDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  artistId?: string;

  @IsOptional()
  @IsEnum(ComicStatus)
  status?: ComicStatus;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ageRating?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genreIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}
