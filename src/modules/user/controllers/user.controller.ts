import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';
import MongooseClassSerializeInterceptor from '../../../common/interceptor/mongoose-class-serialize.interceptor';
import { MongoIdValidationPipe } from '../../../common/validation/mongoid-validation.pipe';

@ApiTags('User')
@Controller('users')
@UseInterceptors(MongooseClassSerializeInterceptor(User))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id', MongoIdValidationPipe) id: string) {
    const user = await this.userService.getUserById(id);

    return { user };
  }
}
