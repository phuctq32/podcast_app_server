import { Module } from '@nestjs/common';
import { MediaController } from './controller/media.controller';
import { MediaService } from './service/media.service';
import { CloudinaryModule } from '../../utils/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
