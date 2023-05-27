import {
  ClassSerializerInterceptor,
  Logger,
  PlainLiteralObject,
  Type,
} from '@nestjs/common';
import { Document } from 'mongoose';
import { ClassTransformOptions, plainToClass } from 'class-transformer';

export default function MongooseClassSerializeInterceptor(
  classToIntercept: Type,
): typeof ClassSerializerInterceptor {
  return class Interceptor extends ClassSerializerInterceptor {
    private readonly logger: Logger = new Logger(
      MongooseClassSerializeInterceptor.name,
    );
    private changePlainObjectToClass(obj: PlainLiteralObject) {
      if (obj instanceof Document) {
        return plainToClass(classToIntercept, obj.toJSON());
      }

      if (typeof obj === 'object') {
        Object.keys(obj).forEach((key) => {
          obj[key] = this.changePlainObjectToClass(obj[key]);
        });
      }

      return obj;
    }

    private prepareResponse(
      response:
        | PlainLiteralObject
        | PlainLiteralObject[]
        | { items: PlainLiteralObject[]; count: number },
    ) {
      if (!Array.isArray(response) && response?.items) {
        const items = this.prepareResponse(response.items);
        return {
          count: response.count,
          items,
        };
      }

      if (Array.isArray(response)) {
        return response.map(this.changePlainObjectToClass);
      }

      return this.changePlainObjectToClass(response);
    }

    serialize(
      response: PlainLiteralObject | PlainLiteralObject[],
      options: ClassTransformOptions,
    ) {
      this.logger.log(`Transforming response...`);
      return super.serialize(this.prepareResponse(response), options);
    }
  };
}
