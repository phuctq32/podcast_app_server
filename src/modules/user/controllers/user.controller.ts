import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../../../utils/jwt/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ResponseMessage } from '../../../common/decorators/message-response.decorator';
import { User } from '../../../entities/user.entity';
import MongooseClassSerializeInterceptor from '../../../common/interceptor/mongoose-class-serialize.interceptor';
import { ChangePasswordUserDto } from '../dto/change-password-user.dto';

@ApiTags('User')
@Controller('users')
@UseInterceptors(MongooseClassSerializeInterceptor(User))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth('JWT')
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req) {
    const user = await this.userService.getUserById(req.user.userId);

    return { user };
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Patch('/update')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Update user successfully')
  async updateUser(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    updateUserDto.id = req.user.userId;
    const user = await this.userService.updateUser(updateUserDto);

    return { user };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);

    return { user };
  }

  @ApiBearerAuth('JWT')
  @Patch('profile/change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Change password successfully')
  async changePassword(@Req() req, @Body() dto: ChangePasswordUserDto) {
    dto.id = req.user.userId;
    return await this.userService.changeUserPassword(dto);
  }
}
