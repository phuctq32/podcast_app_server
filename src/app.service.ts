import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getDocumentLink(): string {
    return `${this.configService.get<string>('DOMAIN')}/api-docs`;
  }
}
