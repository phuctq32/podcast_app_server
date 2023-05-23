import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  FullHttpException,
  HttpExceptionResponse,
} from './http-exception.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();

    let statusCode: number;
    let error: string;
    let message: string;
    const fullExceptionResponse: FullHttpException = {
      method: request.method,
      path: request.url,
      time: new Date(),
    } as FullHttpException;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const errResponse = exception.getResponse();
      if (typeof errResponse === 'string') {
        message = errResponse;
      } else {
        message = (errResponse as HttpExceptionResponse).message;

        error = (errResponse as HttpExceptionResponse).error;
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

    console.log(fullExceptionResponse);

    response
      .status(statusCode)
      .json(this.getHttpExceptionResponse(fullExceptionResponse));
  }

  private getHttpExceptionResponse(
    e: FullHttpException,
  ): HttpExceptionResponse {
    return {
      statusCode: e.statusCode,
      error: e.error,
      message: e.message,
    } as HttpExceptionResponse;
  }
}
