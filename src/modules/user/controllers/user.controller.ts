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
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../../../common/jwt/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppResponseService } from '../../../common/reponse/response.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ResponseMessage } from '../../../common/decorators/message-response.decorator';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(
    private readonly appResponseService: AppResponseService,
    private readonly userService: UserService,
  ) {}

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
}
