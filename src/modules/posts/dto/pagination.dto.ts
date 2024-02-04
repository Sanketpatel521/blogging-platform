import { Transform } from 'class-transformer';
import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  page: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  pageSize: number;
}
