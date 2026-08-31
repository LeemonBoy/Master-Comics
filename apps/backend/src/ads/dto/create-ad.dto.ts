import { IsString, IsOptional, IsUrl, IsEnum, IsDateString, IsBoolean, MaxLength } from 'class-validator';
import { AdPlacement } from '@prisma/client';

export class CreateAdDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsEnum(AdPlacement)
  placement: AdPlacement;

  @IsString()
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  linkUrl?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAdDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEnum(AdPlacement)
  placement?: AdPlacement;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  linkUrl?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
