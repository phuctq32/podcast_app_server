import { registerAs } from '@nestjs/config';
import * as process from 'process';

export default registerAs(
  'cloudinary',
  (): Record<string, any> => ({
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  }),
);
