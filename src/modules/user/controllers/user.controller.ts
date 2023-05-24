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
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppResponseService } from '../../../common/reponse/response.service';
import { AppResponse } from '../../../common/reponse/response.inteface';
import { UpdateUserDto } from '../dto/update-user.dto';

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
  async getProfile(@Request() req): Promise<AppResponse> {
    const user = await this.userService.getUserById(req.user.userId);

    return this.appResponseService.GetResponse('', { user });
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Patch('/update')
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<AppResponse> {
    updateUserDto.id = req.user.userId;
    const user = await this.userService.updateUser(updateUserDto);

    return this.appResponseService.GetResponse('Updated successfully', {
      user,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id') id: string): Promise<AppResponse> {
    const user = await this.userService.getUserById(id);

    return this.appResponseService.GetResponse('', { user });
  }
}
