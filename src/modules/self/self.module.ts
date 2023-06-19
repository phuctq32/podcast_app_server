import { Module } from '@nestjs/common';
import { SelfController } from './controller/self.controller';
import { UserModule } from '../user/user.module';
import { EpisodeModule } from '../episode/episode.module';

@Module({
  imports: [UserModule, EpisodeModule],
  controllers: [SelfController],
})
export class SelfModule {}
