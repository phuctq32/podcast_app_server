import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EpisodeService } from '../service/episode.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateEpisodeDto } from '../dto/create-episode.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/decorators/message-response.decorator';
import { Episode } from '../../../entities/episode.entity';
import MongooseClassSerializeInterceptor from '../../../common/interceptor/mongoose-class-serialize.interceptor';
import { CreatorGuard } from '../../../common/guards/creator.guard';
import { Requester } from '../../../common/decorators/requester.decorator';
import { JwtPayload } from '../../../utils/jwt/jwt-payload.interface';
import { MongoIdValidationPipe } from '../../../common/validation/mongoid-validation.pipe';
import { UpdateEpisodeDto } from '../dto/update-episode.dto';
import {
  PaginationDto,
  PaginationParams,
} from '../../../common/pagination/pagination.dto';

@ApiTags('Episode')
@Controller('episodes')
@UseInterceptors(MongooseClassSerializeInterceptor(Episode))
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @ApiOperation({ summary: 'Get an episode by id' })
  @ApiBearerAuth('JWT')
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getEpisodeById(
    @Requester() requester: JwtPayload,
    @Param('id', MongoIdValidationPipe) episodeId: string,
  ) {
    return await this.episodeService.getEpisodeById(
      episodeId,
      requester.userId,
    );
  }

  @ApiOperation({ summary: 'Create an episode' })
  @ApiBearerAuth('JWT')
  @Post()
  @UseGuards(JwtAuthGuard, CreatorGuard)
  @ResponseMessage('Create episode successfully')
  async createEpisode(
    @Requester() requester: JwtPayload,
    @Body() dto: CreateEpisodeDto,
  ) {
    dto.user_id = requester.userId;
    return await this.episodeService.createEpisode(dto);
  }

  @ApiOperation({ summary: 'Update episode' })
  @ApiBearerAuth('JWT')
  @Patch(':id')
  @UseGuards(JwtAuthGuard, CreatorGuard)
  @ResponseMessage('Update episode successfully')
  async updateEpisode(
    @Requester() requester: JwtPayload,
    @Param('id', MongoIdValidationPipe) episodeId: string,
    @Body() dto: UpdateEpisodeDto,
  ) {
    return await this.episodeService.updateEpisode(
      episodeId,
      requester.userId,
      dto,
    );
  }

  @ApiOperation({ summary: 'Search episodes' })
  @ApiBearerAuth('JWT')
  @Post('/search')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async searchEpisodes(
    @Query('q') searchTerm: string,
    @Query() paginationData: PaginationParams,
  ) {
    const paginationDto = new PaginationDto(paginationData);
    return await this.episodeService.searchEpisodes(
      searchTerm,
      paginationDto.getData(),
    );
  }
}
