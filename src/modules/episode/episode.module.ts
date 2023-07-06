import { forwardRef, Module } from '@nestjs/common';
import { Episode, EpisodeSchemaFactory } from '../../entities/episode.entity';
import { EpisodeService } from './service/episode.service';
import { EpisodeController } from './controller/episode.controller';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { PodcastModule } from '../podcast/podcast.module';
import { UserModule } from '../user/user.module';
import { User } from '../../entities/user.entity';
import { PaginationService } from '../../common/pagination/pagination.service';
import { RemoveAccentsService } from '../../common/remove-accents.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Episode.name,
        useFactory: EpisodeSchemaFactory,
        imports: [UserModule],
        inject: [getModelToken(User.name)],
      },
    ]),
    forwardRef(() => PodcastModule),
    UserModule,
  ],
  controllers: [EpisodeController],
  providers: [EpisodeService, PaginationService, RemoveAccentsService],
  exports: [MongooseModule, EpisodeService],
})
export class EpisodeModule {}
