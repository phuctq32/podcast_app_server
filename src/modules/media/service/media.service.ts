import { Injectable, Logger } from '@nestjs/common';
import { CloudinaryService } from '../../../utils/cloudinary/cloudinary.service';

@Injectable()
export class MediaService {
  private readonly logger: Logger = new Logger(MediaService.name);
  constructor(private readonly cloudinaryService: CloudinaryService) {}
  async uploadAudio(file: Express.Multer.File) {
    this.logger.log(`In func ${this.uploadAudio.name}`);

    const res = await this.cloudinaryService.uploadAudioFile(file);

    return { url: res.secure_url };
  }

  async uploadImage(file: Express.Multer.File) {
    this.logger.log(`In func ${this.uploadImage.name}`);

    const res = await this.cloudinaryService.uploadImageFile(file);

    return { url: res.secure_url };
  }
}
