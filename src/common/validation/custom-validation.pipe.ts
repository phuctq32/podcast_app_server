import {
  ArgumentMetadata,
  Injectable,
  Logger,
  ValidationPipe,
} from '@nestjs/common';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  private readonly logger: Logger = new Logger(ValidationPipe.name);
  transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    this.logger.log('Validating...');
    return super.transform(value, metadata);
  }
}
