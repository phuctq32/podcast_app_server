import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() user: CreateUserDto) {
    await this.authService.register(CreateUserDto.plainToInstance(user));

    return { message: 'Register successfully' };
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    const jwtToken: string = await this.authService.login(req.user);

    return { access_token: jwtToken };
  }

  @Post('verification/:userId')
  @HttpCode(HttpStatus.OK)
  async verify(
    @Param('userId') userId: string,
    @Body('verificationCode') verificationCode: string,
  ) {
    await this.authService.verify(userId.trim(), verificationCode.trim());

    return { message: 'Verify successfully' };
  }
}
