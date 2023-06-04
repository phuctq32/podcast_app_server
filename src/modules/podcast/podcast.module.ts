import { Module } from '@nestjs/common';
import { Podcast, PodcastSchemaFactory } from '../../entities/podcast.entity';
import { PodcastService } from './service/podcast.service';
import { PodcastController } from './controller/podcast.controller';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { EpisodeModule } from '../episode/episode.module';
import { CategoryModule } from '../category/category.module';
import { Episode } from '../../entities/episode.entity';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Podcast.name,
        useFactory: PodcastSchemaFactory,
        imports: [EpisodeModule],
        inject: [getModelToken(Episode.name)],
      },
    ]),
    UserModule,
    EpisodeModule,
    CategoryModule,
  ],
  controllers: [PodcastController],
  providers: [PodcastService],
  exports: [MongooseModule],
})
export class PodcastModule {}
