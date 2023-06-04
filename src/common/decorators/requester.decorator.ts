import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../utils/jwt/jwt-payload.interface';

export const Requester = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
