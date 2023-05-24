class HttpExceptionResponse {
  statusCode: number;
  error: string;
  message: any;
}

export class FullHttpException extends HttpExceptionResponse {
  rootError: any;
  path: string;
  method: string;
  time: Date;

  getResponse(): HttpExceptionResponse {
    return {
      statusCode: this.statusCode,
      error: this.error,
      message: this.message,
    };
  }

  // setStatusCode(statusCode: number): void {
  //   super.statusCode = statusCode;
  // }
  //
  // setError()
}
