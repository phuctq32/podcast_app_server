import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('API')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOkResponse({ description: 'Got the document page!' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
