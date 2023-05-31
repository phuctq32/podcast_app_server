import { Module } from '@nestjs/common';
import { Podcast, PodcastSchemaFactory } from '../../entities/podcast.entity';
import { PodcastService } from './service/podcast.service';
import { PodcastController } from './controller/podcast.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { EpisodeModule } from '../episode/episode.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      { name: Podcast.name, useFactory: PodcastSchemaFactory },
    ]),
    UserModule,
    EpisodeModule,
  ],
  controllers: [PodcastController],
  providers: [PodcastService],
  exports: [MongooseModule],
})
export class PodcastModule {}
