import { Injectable } from '@nestjs/common';
import { MailService } from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';
import { EmailConfig } from './email-config.interface';

@Injectable()
export class SendEmailService {
  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {
    mailService.setApiKey(this.configService.get<string>('sendgrid.apiKey'));
  }

  async sendEmailWithDynamicTemplate(config: EmailConfig) {
    await this.mailService.send({
      from: this.configService.get<string>('sendgrid.fromEmail'),
      ...config,
    });
  }
}
