export interface HttpExceptionResponse {
  statusCode: number;
  error: string;
  message?: any;
}

export interface FullHttpException extends HttpExceptionResponse {
  rootError: any;
  path: string;
  method: string;
  time: Date;
}
