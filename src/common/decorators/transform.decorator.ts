import { ClassConstructor, Transform, Type } from 'class-transformer';
import { applyDecorators } from '@nestjs/common';
import { Types } from 'mongoose';

/**
 * If value type ObjectId, still keep it (return value).
 *
 * If value is object, plain to instance of classToTransform.
 *
 * Can be used for ObjectId and ObjectId Array.
 *
 * @param {Class} classToTransform Class which is value transform to.
 */
const ObjectIdTypeTransform = (classToTransform: () => ClassConstructor<any>) =>
  Type(({ object, property }) => {
    // If object[property] is an ObjectId array, return undefined (still keep value, not transform)
    if (Array.isArray(object[property])) {
      if (
        object[property].length == 0 ||
        Types.ObjectId.isValid(object[property][0].toString())
      ) {
        if (typeof object[property][0] === 'string') {
          return undefined;
        }
        return String;
      }
    }

    // If object[property] is an ObjectId, return undefined (still keep value, not transform)
    if (Types.ObjectId.isValid(object[property].toString())) {
      if (typeof object[property][0] === 'string') {
        return undefined;
      }
      return String;
    }

    return classToTransform();
  });

/**
 * If value type is ObjectId, transform to string.
 *
 * Don't use for virtual properties.
 */
export const ClassTransform = (classToTransform: () => ClassConstructor<any>) =>
  applyDecorators(ObjectIdTypeTransform(classToTransform));

/**
 * Transform array. Combine ObjectIdTypeTransform and ArrayTransform.
 *
 * Don't use for virtual properties
 **/
export const ArrayClassTransform = (
  classToTransform: () => ClassConstructor<any>,
) =>
  applyDecorators(
    ObjectIdTypeTransform(classToTransform),
    Transform(
      ({ obj, key }) => {
        const items = obj[key];
        const count = obj[key].length;

        return { items, count };
      },
      {
        toPlainOnly: true,
      },
    ),
  );
