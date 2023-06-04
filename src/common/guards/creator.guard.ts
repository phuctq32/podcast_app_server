import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CreatorGuard implements CanActivate {
  private readonly logger: Logger = new Logger(CreatorGuard.name);
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    this.logger.log('Checking whether user is creator or not...');

    const request = context.switchToHttp().getRequest();

    console.log(request.user);
    if (!request.user.isCreator) {
      throw new BadRequestException('You are not creator');
    }

    return true;
  }
}
