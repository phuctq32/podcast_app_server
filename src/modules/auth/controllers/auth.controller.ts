import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import {
  ForgotPasswordVerificationDto,
  ResetPasswordDto,
} from '../dto/reset-password.dto';
import {
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import UserLoginDto from '../dto/user-login.dto';
import { AppResponseService } from '../../../common/reponse/response.service';

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

  @ApiBody({
    type: UserLoginDto,
    description: 'User credentials',
  })
  @ApiOkResponse({
    description: 'Authentication token',
    schema: {
      properties: {
        access_token: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'The username or password entered are not valid',
  })
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    const jwtToken: string = await this.authService.login(req.user);

    return this.appResponseService.GetResponse('Login successfully', {
      access_token: jwtToken,
    });
  }

  @ApiBody({
    schema: {
      properties: {
        verificationCode: { type: 'string', example: 'abcxyz' },
      },
    },
  })
  @Post('verification/:id')
  @HttpCode(HttpStatus.OK)
  async verify(
    @Param('id') userId: string,
    @Body('verificationCode') verificationCode: string,
  ) {
    await this.authService.verify(userId.trim(), verificationCode.trim());

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
}
