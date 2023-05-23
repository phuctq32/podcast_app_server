import { registerAs } from '@nestjs/config';
import * as process from 'process';

export default registerAs(
  'googleOAuth',
  (): Record<string, any> => ({
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  }),
);
