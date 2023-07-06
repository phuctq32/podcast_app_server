import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

const DEFAULT_OFFSET = 1;
const DEFAULT_LIMIT = 10;

export class PaginationParams {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  offset: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit: number;
}

export class PaginationDto {
  offset: number;
  limit: number;

  constructor(private data: PaginationParams) {
    this.offset = data.offset;
    this.limit = data.limit;
  }

  getData(): PaginationDto {
    if (!this.offset && !this.limit) {
      return null;
    }
    if (this.offset < 1) {
      this.offset = DEFAULT_OFFSET;
    }
    if (this.limit < 1) {
      this.limit = DEFAULT_LIMIT;
    }
    return this;
  }
}
