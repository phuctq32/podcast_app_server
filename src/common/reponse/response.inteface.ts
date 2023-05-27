export class AppResponse {
  message: string;
  data: any;
}

export interface Response<T> {
  message: string;
  data: T;
}
