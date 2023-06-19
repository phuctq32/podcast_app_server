import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import MongooseClassSerializeInterceptor from '../../../common/interceptor/mongoose-class-serialize.interceptor';
import { Category } from '../../../entities/category.entity';
import { CategoryService } from '../service/category.service';
import { ResponseMessage } from '../../../common/decorators/message-response.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CreateCategoryDto } from '../dto/create-category.dto';

@ApiTags('Category')
@Controller('categories')
@UseInterceptors(MongooseClassSerializeInterceptor(Category))
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Get all categories' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getCategories() {
    return await this.categoryService.listCategories();
  }

  @ApiOperation({
    summary: 'Create category',
    description: 'This API only use to create default categories for app',
  })
  @ApiBearerAuth('JWT')
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Create category successfully')
  async createCategory(@Body() dto: CreateCategoryDto) {
    return await this.categoryService.createCategory(dto);
  }
}
