import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from './base.entity';

@Schema()
export class Category extends BaseEntity {
  @Prop()
  name: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

export const CategorySchemaFactory = async () => {
  return CategorySchema;
};
