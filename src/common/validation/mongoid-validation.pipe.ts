import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class MongoIdValidationPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): any {
    if (
      Types.ObjectId.isValid(value) &&
      String(new Types.ObjectId(value)) === value
    ) {
      return value;
    }

    throw new BadRequestException('Invalid Id');
  }
}
