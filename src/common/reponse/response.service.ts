import { Injectable } from '@nestjs/common';
import { AppResponse } from './response.inteface';

@Injectable()
export class AppResponseService {
  GetResponse(message: string, data: any): AppResponse {
    return { message, data } as AppResponse;
  }
}
