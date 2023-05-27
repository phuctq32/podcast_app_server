import { SetMetadata } from '@nestjs/common';

export const ResponseMessageKey = 'ResMsgKey';
export const ResponseMessage = (message: string) =>
  SetMetadata(ResponseMessageKey, message);
