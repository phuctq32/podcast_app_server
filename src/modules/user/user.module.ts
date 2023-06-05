import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { User, UserSchemaFactory } from '../../entities/user.entity';
import { HashService } from '../../utils/hash/hash.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Playlist,
  PlaylistSchemaFactory,
} from '../../entities/playlist.entity';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      { name: User.name, useFactory: UserSchemaFactory },
      { name: Playlist.name, useFactory: PlaylistSchemaFactory },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, HashService],
  exports: [MongooseModule],
})
export class UserModule {}
