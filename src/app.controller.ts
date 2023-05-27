import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('API')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOkResponse({ description: 'Got the document page!' })
  @Get()
  getDocumentPage(@Res() res) {
    res.redirect(this.appService.getDocumentLink());
  }
}
