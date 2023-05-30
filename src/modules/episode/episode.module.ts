import { Module } from '@nestjs/common';
import { Episode, EpisodeSchemaFactory } from '../../entities/episode.entity';
import { EpisodeService } from './service/episode.service';
import { EpisodeController } from './controller/episode.controller';
import { Podcast, PodcastSchemaFactory } from '../../entities/podcast.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      { name: Episode.name, useFactory: EpisodeSchemaFactory },
      { name: Podcast.name, useFactory: PodcastSchemaFactory },
    ]),
  ],
  controllers: [EpisodeController],
  providers: [EpisodeService],
})
export class EpisodeModule {}
