import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PodcastService } from '../service/podcast.service';
import { ResponseMessage } from '../../../common/decorators/message-response.decorator';
import { CreatePodcastDto } from '../dto/create-podcast.dto';
import { JwtAuthGuard } from '../../../utils/jwt/jwt-auth.guard';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import MongooseClassSerializeInterceptor from '../../../common/interceptor/mongoose-class-serialize.interceptor';
import { Podcast } from '../../../entities/podcast.entity';

@ApiTags('Podcast')
@Controller('podcasts')
@UseInterceptors(MongooseClassSerializeInterceptor(Podcast))
export class PodcastController {
  constructor(private readonly podcastService: PodcastService) {}

  @ApiBearerAuth('JWT')
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Create podcast successfully')
  async createPodcast(@Req() req, @Body() dto: CreatePodcastDto) {
    dto.author_id = req.user.userId;
    return await this.podcastService.createPodcast(dto);
  }

  @ApiBearerAuth('JWT')
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getPodcastById(@Req() req, @Param('id') podcastId: string) {
    return await this.podcastService.getPodcastById(podcastId, req.user.userId);
  }
}
