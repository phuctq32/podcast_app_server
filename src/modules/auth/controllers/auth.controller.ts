import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
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
import { ResponseMessage } from '../../../common/decorators/message-response.decorator';
import MongooseClassSerializeInterceptor from '../../../common/interceptor/mongoose-class-serialize.interceptor';
import { User } from '../../../entities/user.entity';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly appResponseService: AppResponseService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Register successfully')
  async register(@Body() user: CreateUserDto) {
    await this.authService.register(CreateUserDto.plainToInstance(user));

    return null;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login successfully')
  @UseInterceptors(MongooseClassSerializeInterceptor(User))
  async login(@Body() loginDto: UserLoginDto) {
    return await this.authService.login(loginDto);
  }

  @ApiBody({
    type: ForgotPasswordVerificationDto,
  })
  @Post('verification')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Verify successfully')
  async verify(@Body() dto: ForgotPasswordVerificationDto) {
    await this.authService.verify(dto);

    return null;
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
  @ResponseMessage('Please check your email to reset your password!')
  async forgotPassword(@Body('email') email: string) {
    await this.authService.forgotPassword(email.trim());

    return null;
  }

  @Post('forgot-password/verification')
  @HttpCode(HttpStatus.OK)
  async verifyResetPasswordCode(
    @Body() fgPwVefificationDto: ForgotPasswordVerificationDto,
  ) {
    const resetToken = await this.authService.verifyResetPasswordCode(
      fgPwVefificationDto,
    );

    return { reset_token: resetToken };
  }

  @Patch('reset-password/:token')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Reset password successfully')
  async resetPassword(
    @Param('token') resetToken: string,
    @Body() resetPwDto: ResetPasswordDto,
  ) {
    await this.authService.resetPassword(resetToken, resetPwDto.password);

    return null;
  }

  // Google OAuth
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async loginWithGoogle() {}

  @Get('google/redirect')
  @UseGuards(GoogleOauthGuard)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login with google successfully')
  @UseInterceptors(MongooseClassSerializeInterceptor(User))
  async loginWithGoogleRedirect(@Req() req) {
    return await this.authService.loginWithGoogle(req.user);
  }

  // Login by access token from google oauth
  @Post('login/google')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login with google successfully')
  @UseInterceptors(MongooseClassSerializeInterceptor(User))
  async loginWithGoogleAccessToken(@Query('access_token') accessToken: string) {
    return await this.authService.loginWithGoogleAccessToken(accessToken);
  }
}
