import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PodcastService } from '../service/podcast.service';
import { ResponseMessage } from '../../../common/decorators/message-response.decorator';
import { CreatePodcastDto } from '../dto/create-podcast.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import MongooseClassSerializeInterceptor from '../../../common/interceptor/mongoose-class-serialize.interceptor';
import { Podcast } from '../../../entities/podcast.entity';
import { CreatorGuard } from '../../../common/guards/creator.guard';
import { Requester } from '../../../common/decorators/requester.decorator';
import { JwtPayload } from '../../../utils/jwt/jwt-payload.interface';
import { MongoIdValidationPipe } from '../../../common/validation/mongoid-validation.pipe';

@ApiTags('Podcast')
@Controller('podcasts')
@UseInterceptors(MongooseClassSerializeInterceptor(Podcast))
export class PodcastController {
  constructor(private readonly podcastService: PodcastService) {}

  @ApiBearerAuth('JWT')
  @Post()
  @UseGuards(JwtAuthGuard, CreatorGuard)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Create podcast successfully')
  async createPodcast(
    @Requester() requester: JwtPayload,
    @Body() dto: CreatePodcastDto,
  ) {
    dto.author_id = requester.userId;
    return await this.podcastService.createPodcast(dto);
  }

  @ApiBearerAuth('JWT')
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getPodcastById(
    @Requester() requester: JwtPayload,
    @Param('id', MongoIdValidationPipe) podcastId: string,
  ) {
    return await this.podcastService.getPodcastById(
      podcastId,
      requester.userId,
    );
  }
}
