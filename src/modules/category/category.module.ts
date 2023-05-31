import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Category,
  CategorySchemaFactory,
} from '../../entities/category.entity';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      { name: Category.name, useFactory: CategorySchemaFactory },
    ]),
  ],
})
export class CategoryModule {}
