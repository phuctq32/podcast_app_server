import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from './base.entity';
import { HydratedDocument, PopulatedDoc } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;
export type CategoryPopulatedDoc = PopulatedDoc<CategoryDocument>;

@Schema()
export class Category extends BaseEntity {
  @Prop()
  name: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

export const CategorySchemaFactory = async () => {
  return CategorySchema;
};
