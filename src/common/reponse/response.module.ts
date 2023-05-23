import { Module } from '@nestjs/common';
import { AppResponseService } from './response.service';

@Module({
  providers: [AppResponseService],
  exports: [AppResponseService],
})
export class AppResponseModule {}
