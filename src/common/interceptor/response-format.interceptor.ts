import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Response } from '../reponse/response.inteface';
import { ResponseMessageKey } from '../decorators/message-response.decorator';

@Injectable()
export class ResponseFormatInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  private readonly logger: Logger = new Logger(ResponseFormatInterceptor.name);
  constructor(private readonly reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<Response<T>> | Promise<Observable<Response<T>>> {
    const msg =
      this.reflector.get<string>(ResponseMessageKey, context.getHandler()) ??
      '';

    return next.handle().pipe(
      map((data) => {
        this.logger.log('Formatting response....');
        return {
          message: msg,
          data: data,
        };
      }),
    );
  }
}
