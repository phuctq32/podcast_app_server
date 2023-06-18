import {
  ClassSerializerInterceptor,
  Logger,
  PlainLiteralObject,
  Type,
} from '@nestjs/common';
import { Document } from 'mongoose';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';

export default function MongooseClassSerializeInterceptor(
  classToIntercept: Type,
): typeof ClassSerializerInterceptor {
  return class Interceptor extends ClassSerializerInterceptor {
    private readonly logger: Logger = new Logger(
      MongooseClassSerializeInterceptor.name,
    );
    private changePlainObjectToClass(obj: PlainLiteralObject) {
      if (obj instanceof Document) {
        return plainToInstance(classToIntercept, obj.toJSON());
      }

      if (Array.isArray(obj)) {
        return obj.map(this.changePlainObjectToClass);
      } else if (typeof obj === 'object') {
        Object.keys(obj).forEach((key) => {
          obj[key] = this.changePlainObjectToClass(obj[key]);
        });
      }

      return obj;
    }

    private prepareResponse(response: object) {
      Object.keys(response).forEach((key) => {
        if (Array.isArray(response[key])) {
          response[key] = {
            items: this.changePlainObjectToClass(response[key]),
            count: response[key].length,
          };
        } else {
          response[key] = this.changePlainObjectToClass(response[key]);
        }
      });

      return response;
    }

    serialize(
      response: PlainLiteralObject | PlainLiteralObject[],
      options: ClassTransformOptions,
    ) {
      this.logger.log(`Transforming response...`);
      this.logger.debug(classToIntercept.name);
      return super.serialize(this.prepareResponse(response), options);
    }
  };
}
