import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import MongooseClassSerializeInterceptor from '../../../common/interceptor/mongoose-class-serialize.interceptor';
import { Category } from '../../../entities/category.entity';
import { CategoryService } from '../service/category.service';
import { ResponseMessage } from '../../../common/decorators/message-response.decorator';
import { JwtAuthGuard } from '../../../common/jwt/jwt-auth.guard';
import { CreateCategoryDto } from '../dto/create-category.dto';

@ApiTags('Category')
@Controller('categories')
@UseInterceptors(MongooseClassSerializeInterceptor(Category))
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiBearerAuth('JWT')
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Create category successfully')
  async createCategory(@Body() dto: CreateCategoryDto) {
    return await this.categoryService.createCategory(dto);
  }
}
