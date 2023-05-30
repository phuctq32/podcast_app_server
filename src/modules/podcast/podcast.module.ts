import { Module } from '@nestjs/common';
import { Podcast, PodcastSchemaFactory } from '../../entities/podcast.entity';
import { User, UserSchemaFactory } from '../../entities/user.entity';
import { PodcastService } from './service/podcast.service';
import { PodcastController } from './controller/podcast.controller';
import { Episode, EpisodeSchemaFactory } from '../../entities/episode.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      { name: Podcast.name, useFactory: PodcastSchemaFactory },
      { name: User.name, useFactory: UserSchemaFactory },
      { name: Episode.name, useFactory: EpisodeSchemaFactory },
    ]),
  ],
  controllers: [PodcastController],
  providers: [PodcastService],
})
export class PodcastModule {}
