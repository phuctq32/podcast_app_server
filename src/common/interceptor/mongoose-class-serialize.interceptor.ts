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

    private prepareResponse(
      response: PlainLiteralObject | PlainLiteralObject[],
    ) {
      if (response['data']) {
        const data = response['data'];
        if (Array.isArray(data)) {
          return {
            items: this.changePlainObjectToClass(data),
            count: data.length,
            ...response['pagination'],
          };
        }
      } else {
        if (Array.isArray(response)) {
          return {
            items: this.changePlainObjectToClass(response),
            count: response.length,
          };
        }

        return this.changePlainObjectToClass(response);
      }
    }

    serialize(
      response: PlainLiteralObject | PlainLiteralObject[],
      options: ClassTransformOptions,
    ) {
      this.logger.log(`Transforming response...`);
      this.logger.debug(classToIntercept.name);
      if (response === null) {
        return null;
      }
      return super.serialize(this.prepareResponse(response), options);
    }
  };
}
