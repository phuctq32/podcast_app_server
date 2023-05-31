import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from '../../../entities/category.entity';
import { Model } from 'mongoose';
import { CreatePodcastDto } from '../../podcast/dto/create-podcast.dto';

@Injectable()
export class CategoryService {
  private readonly logger: Logger = new Logger(CategoryService.name);
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async createCategory(dto: CreatePodcastDto) {
    const newCategory = await this.categoryModel.create(dto);

    return { newCategory };
  }
}
