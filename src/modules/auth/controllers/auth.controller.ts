import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import {
  ForgotPasswordVerificationDto,
  ResetPasswordDto,
} from '../dto/reset-password.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { UserLoginDto } from '../dto/user-login.dto';
import { AppResponseService } from '../../../common/reponse/response.service';
import { GoogleOauthGuard } from '../guards/google-oauth.guard';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly appResponseService: AppResponseService,
  ) {}

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() user: CreateUserDto) {
    await this.authService.register(CreateUserDto.plainToInstance(user));

    return this.appResponseService.GetResponse('Register successfully', null);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: UserLoginDto) {
    const data = await this.authService.login(loginDto);

    return this.appResponseService.GetResponse('Login successfully', data);
  }

  @ApiBody({
    type: ForgotPasswordVerificationDto,
  })
  @Post('verification')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() dto: ForgotPasswordVerificationDto) {
    await this.authService.verify(dto);

    return this.appResponseService.GetResponse('Verify successfully', null);
  }

  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string' },
      },
    },
  })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    await this.authService.forgotPassword(email.trim());

    return this.appResponseService.GetResponse(
      'Please check your email to reset your password!',
      null,
    );
  }

  @Post('forgot-password/verification')
  @HttpCode(HttpStatus.OK)
  async verifyResetPasswordCode(
    @Body() fgPwVefificationDto: ForgotPasswordVerificationDto,
  ) {
    const resetToken = await this.authService.verifyResetPasswordCode(
      fgPwVefificationDto,
    );

    return this.appResponseService.GetResponse('', { reset_token: resetToken });
  }

  @Patch('reset-password/:token')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('token') resetToken: string,
    @Body() resetPwDto: ResetPasswordDto,
  ) {
    await this.authService.resetPassword(resetToken, resetPwDto.password);

    return this.appResponseService.GetResponse(
      'Reset password successfully',
      null,
    );
  }

  // Google OAuth
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async loginWithGoogle() {}

  @Get('google/redirect')
  @UseGuards(GoogleOauthGuard)
  @HttpCode(HttpStatus.OK)
  async loginWithGoogleRedirect(@Req() req) {
    const data = await this.authService.loginWithGoogle(req.user);

    return this.appResponseService.GetResponse(
      'Login with google successfully',
      data,
    );
  }
}
