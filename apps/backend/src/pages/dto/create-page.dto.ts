import { IsString, IsOptional, IsInt, IsUrl, IsArray, Min } from 'class-validator';

export class CreatePageDto {
  @IsString()
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageNumber?: number;
}

export class UpdatePageDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  pageNumber?: number;
}

export class ReorderPagesDto {
  @IsArray()
  pageIds: string[];
}
