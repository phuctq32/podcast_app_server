import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger: Logger = new Logger(JwtAuthGuard.name);

  handleRequest(err, user) {
    if (err || !user) {
      this.logger.log('Authentication failed. Access denied');
      throw err || new UnauthorizedException();
    }
    this.logger.log('Successful authentication');
    return user;
  }
}
