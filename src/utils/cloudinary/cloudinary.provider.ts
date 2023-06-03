import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { CLOUDINARY } from './constants';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (configService: ConfigService) =>
    cloudinary.config({
      api_key: configService.get<string>('cloudinary.apiKey'),
      api_secret: configService.get<string>('cloudinary.apiSecret'),
      cloud_name: configService.get<string>('cloudinary.cloudName'),
    }),
  inject: [ConfigService],
};
