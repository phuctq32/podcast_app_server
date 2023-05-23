import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppResponseService } from '../../../common/reponse/response.service';
import { AppResponse } from '../../../common/reponse/response.inteface';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(
    private readonly appResponseService: AppResponseService,
    private readonly userService: UserService,
  ) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id') id: string): Promise<AppResponse> {
    const user = await this.userService.getUserById(id);

    return this.appResponseService.GetResponse('', { user });
  }

  @ApiBearerAuth('JWT')
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req): Promise<AppResponse> {
    const user = await this.userService.getUserById(req.userId);

    return this.appResponseService.GetResponse('', { user });
  }
}
