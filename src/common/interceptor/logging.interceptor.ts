import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    this.logger.log(
      `[REQUEST INFO] ${method} ${url} ${context.getClass().name} ${
        context.getHandler().name
      }`,
    );
    if (request.user.userId) {
      this.logger.debug(`userId: ${request.user.userId}`);
    }
    this.logger.debug(`Request body: ${JSON.stringify(request.body)}`);
    this.logger.debug(`Request params: ${JSON.stringify(request.params)}`);
    this.logger.debug(`Request query: ${JSON.stringify(request.query)}`);

    const reqTime = Date.now();

    return next.handle().pipe(
      tap((res) => {
        const response = context.switchToHttp().getResponse();

        this.logger.log(
          `[RESPONSE INFO] ${method} ${url} ${response.statusCode} ${
            Date.now() - reqTime
          }ms`,
        );

        this.logger.debug(`Response: ${JSON.stringify(res)}`);
      }),
    );
  }
}
