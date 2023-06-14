import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Playlist,
  PlaylistSchemaFactory,
} from '../../entities/playlist.entity';
import { UserModule } from '../user/user.module';
import { EpisodeModule } from '../episode/episode.module';
import { PlaylistController } from './controller/playlist.controller';
import { PlaylistService } from './service/playlist.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      { name: Playlist.name, useFactory: PlaylistSchemaFactory },
    ]),
    UserModule,
    EpisodeModule,
  ],
  controllers: [PlaylistController],
  providers: [PlaylistService],
})
export class PlaylistModule {}
