import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FullHttpException } from './http-exception.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();

    let statusCode: number;
    let error: string;
    let message: string;
    // const fullExceptionResponse: FullHttpException = {
    //   method: request.method,
    //   path: request.url,
    //   time: new Date(),
    // };
    const fullExceptionResponse = new FullHttpException();
    fullExceptionResponse.method = request.method;
    fullExceptionResponse.path = request.url;
    fullExceptionResponse.time = new Date();

    console.log(exception);

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const errResponse = exception.getResponse();
      if (typeof errResponse === 'string') {
        message = errResponse;
      } else {
        message = (errResponse as FullHttpException).message;

        error = (errResponse as FullHttpException).error;
        if (!message) {
          message = error;
          error = undefined;
        }
      }
    } else {
      fullExceptionResponse.rootError = exception;
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      error = 'Internal Server Error';
    }

    fullExceptionResponse.statusCode = statusCode;
    fullExceptionResponse.error = error;
    fullExceptionResponse.message = message;

    this.logger.debug(
      `[EXCEPTION INFO] ${JSON.stringify(fullExceptionResponse)}`,
    );

    response.status(statusCode).json(fullExceptionResponse.getResponse());
  }

  // private getHttpExceptionResponse(
  //   e: FullHttpException,
  // ): HttpExceptionResponse {
  //   return {
  //     statusCode: e.statusCode,
  //     error: e.error,
  //     message: e.message,
  //   } as HttpExceptionResponse;
  // }
}
