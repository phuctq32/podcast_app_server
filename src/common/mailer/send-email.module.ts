import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SendEmailService } from './send-email.service';
import { MailService } from '@sendgrid/mail';

@Module({
  imports: [ConfigModule],
  providers: [SendEmailService, ConfigService, MailService],
  exports: [SendEmailService],
})
export class SendEmailModule {}
