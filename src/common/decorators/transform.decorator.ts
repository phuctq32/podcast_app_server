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
        Types.ObjectId.isValid(object[property][0])
      ) {
        console.log(property, 'array undefined');
        return undefined;
      }
    }

    // If object[property] is an ObjectId, return undefined (still keep value, not transform)
    if (Types.ObjectId.isValid(object[property])) {
      console.log(property, 'object undefined');
      return undefined;
    }

    console.log(property, classToTransform());

    return classToTransform();
  });

// /**
//  * Format array to object has the form { items: array, count: arrayLength }
//  */
// export const ArrayTransform = () =>
//   Transform(
//     ({ value }) => {
//       let items = value;
//       const count = value.length;
//
//       if (value.length > 0 && Types.ObjectId.isValid(value[0])) {
//         items = value.map((_id) => _id.toString());
//       }
//
//       return { items, count };
//     },
//     {
//       toPlainOnly: true,
//     },
//   );

/**
 * If value type is ObjectId, transform to string.
 *
 * Don't use for virtual properties.
 */
export const ClassTransform = (classToTransform: () => ClassConstructor<any>) =>
  applyDecorators(
    ObjectIdTypeTransform(classToTransform),
    Transform(({ value }) => {
      if (Types.ObjectId.isValid(value)) {
        return value.toString();
      }
      return value;
    }),
  );

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
      ({ value }) => {
        let items = value;
        const count = value.length;

        if (value.length > 0 && Types.ObjectId.isValid(value[0])) {
          items = value.map((_id) => _id.toString());
        }

        return { items, count };
      },
      {
        toPlainOnly: true,
      },
    ),
  );
