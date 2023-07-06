import { Module } from '@nestjs/common';
import { Podcast, PodcastSchemaFactory } from '../../entities/podcast.entity';
import { PodcastService } from './service/podcast.service';
import { PodcastController } from './controller/podcast.controller';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { EpisodeModule } from '../episode/episode.module';
import { CategoryModule } from '../category/category.module';
import { Episode } from '../../entities/episode.entity';
import { User } from '../../entities/user.entity';
import { RemoveAccentsService } from '../../common/remove-accents.service';
import { PaginationService } from '../../common/pagination/pagination.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Podcast.name,
        useFactory: PodcastSchemaFactory,
        imports: [EpisodeModule, UserModule],
        inject: [getModelToken(Episode.name), getModelToken(User.name)],
      },
    ]),
    UserModule,
    EpisodeModule,
    CategoryModule,
  ],
  controllers: [PodcastController],
  providers: [PodcastService, RemoveAccentsService, PaginationService],
  exports: [MongooseModule],
})
export class PodcastModule {}
