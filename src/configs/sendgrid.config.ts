import { registerAs } from '@nestjs/config';
import * as process from 'process';

export default registerAs(
  'sendgrid',
  (): Record<string, any> => ({
    fromEmail: process.env.FROM_EMAIL,
    apiKey: process.env.SENDGRID_API_KEY,
    verifyEmailTemplateId: process.env.SENDGRID_VERIFY_TEMPlATE_ID,
    forgotPasswordEmailTemplateId:
      process.env.SENDGRID_FORGOT_PASSWORD_TEMPLATE_ID,
  }),
);
