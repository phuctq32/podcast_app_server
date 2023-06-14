import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from '../../../entities/category.entity';
import { Model } from 'mongoose';
import { CreateCategoryDto } from '../dto/create-category.dto';

@Injectable()
export class CategoryService {
  private readonly logger: Logger = new Logger(CategoryService.name);
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async listCategories() {
    this.logger.log(`In func ${this.listCategories.name}`);

    return await this.categoryModel.find();
  }

  async createCategory(dto: CreateCategoryDto) {
    this.logger.log(`In func ${this.createCategory.name}`);

    const newCategory = await this.categoryModel.create(dto);

    return { newCategory };
  }
}
