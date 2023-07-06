import { Injectable } from '@nestjs/common';
import { PaginationDto } from './pagination.dto';
import { PaginationInformation } from './pagination.interface';

@Injectable()
export class PaginationService {
  getInformation(
    paginationDto: PaginationDto,
    totalCount: number,
  ): PaginationInformation {
    let totalPage: number = Math.trunc(totalCount / paginationDto.limit);
    if (totalCount % paginationDto.limit > 0) {
      totalPage++;
    }

    return {
      page: paginationDto.offset,
      per_page: paginationDto.limit,
      total_page: totalPage,
      total_results: totalCount,
    } as PaginationInformation;
  }
}
