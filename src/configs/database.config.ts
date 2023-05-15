import { registerAs } from '@nestjs/config';
import * as process from 'process';

export default registerAs(
  'database',
  (): Record<string, any> => ({
    uri: process.env.MONGO_URI,
    name: process.env.MONGO_DATABASE_NAME,
  }),
);
