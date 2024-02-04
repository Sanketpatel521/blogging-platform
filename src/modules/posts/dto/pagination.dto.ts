import { Transform, Type } from 'class-transformer';
import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  page: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  pageSize: number;
}
