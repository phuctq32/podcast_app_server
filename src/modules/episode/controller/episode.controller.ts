import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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

@ApiTags('Episode')
@Controller('episodes')
@UseInterceptors(MongooseClassSerializeInterceptor(Episode))
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

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

  @ApiOperation({ description: 'Get history listened episodes' })
  @ApiBearerAuth('JWT')
  @Get('/self/listened')
  @UseGuards(JwtAuthGuard)
  async getListenedEpisodes(@Requester() requester: JwtPayload) {
    return await this.episodeService.getListenedEpisodes(requester.userId);
  }

  @ApiBearerAuth('JWT')
  @Patch(':id/listen')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Increased listening frequency')
  async listenEpisode(
    @Requester() requester: JwtPayload,
    @Param('id', MongoIdValidationPipe) episodeId: string,
  ) {
    return await this.episodeService.listen(episodeId, requester.userId);
  }

  // favorite
  @ApiBearerAuth('JWT')
  @Get('favorite')
  @UseGuards(JwtAuthGuard)
  async getFavoriteList(@Requester() requester: JwtPayload) {
    return await this.episodeService.getFavorite(requester.userId);
  }

  @ApiBearerAuth('JWT')
  @Patch(':id/favorite/add')
  @UseGuards(JwtAuthGuard)
  async addEpisodeToFavoriteList(
    @Requester() requester: JwtPayload,
    @Param('id', MongoIdValidationPipe) episodeId: string,
  ) {
    return await this.episodeService.addToFavorite(episodeId, requester.userId);
  }

  @ApiBearerAuth('JWT')
  @Patch(':id/favorite/remove')
  @UseGuards(JwtAuthGuard)
  async removeEpisodeFromFavoriteList(
    @Requester() requester: JwtPayload,
    @Param('id', MongoIdValidationPipe) episodeId: string,
  ) {
    return await this.episodeService.removeFromFavorite(
      episodeId,
      requester.userId,
    );
  }
}
