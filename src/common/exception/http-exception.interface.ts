export interface HttpExceptionResponse {
  statusCode: number;
  error: string;
  message?: any;
}

export interface CustomHttpExceptionResponse extends HttpExceptionResponse {
  path: string;
  method: string;
  timestamp: Date;
}
