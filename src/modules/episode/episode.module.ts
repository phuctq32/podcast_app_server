import { forwardRef, Module } from '@nestjs/common';
import { Episode, EpisodeSchemaFactory } from '../../entities/episode.entity';
import { EpisodeService } from './service/episode.service';
import { EpisodeController } from './controller/episode.controller';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { PodcastModule } from '../podcast/podcast.module';
import { UserModule } from '../user/user.module';
import { User } from '../../entities/user.entity';

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
  providers: [EpisodeService],
  exports: [MongooseModule, EpisodeService],
})
export class EpisodeModule {}
