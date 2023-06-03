import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { ResourceType } from './constants';
import { CloudinaryResponse } from './cloudinary.response';

@Injectable()
export class CloudinaryService {
  private readonly logger: Logger = new Logger(CloudinaryService.name);

  extractPublicId(url: string) {
    return url.split('/').pop().split('.')[0];
  }

  async uploadAudioFile(file: Express.Multer.File) {
    return await this.uploadFile(file, { resourceType: 'video' });
  }

  async uploadImageFile(file: Express.Multer.File) {
    return await this.uploadFile(file, { resourceType: 'image' });
  }

  async deleteAudioFile(publicId: string) {
    return await this.deleteResources([publicId], { resourceType: 'video' });
  }

  async deleteImageFile(publicId: string) {
    return await this.deleteResources([publicId], { resourceType: 'image' });
  }
  private uploadFile(
    file: Express.Multer.File,
    options: { resourceType: ResourceType },
  ): Promise<CloudinaryResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { resource_type: options.resourceType },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }

  private deleteResources(
    publicIds: string[],
    options: { resourceType: ResourceType },
  ) {
    return new Promise(async (resolve, reject) => {
      cloudinary.api.delete_resources(
        publicIds,
        {
          resource_type: options.resourceType,
        },
        (err, res) => {
          if (err) {
            return reject(err);
          }
          return resolve(res);
        },
      );
    });
  }
}
