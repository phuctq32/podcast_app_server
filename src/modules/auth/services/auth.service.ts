import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { UserLoginDto } from '../dto/user-login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../../common/jwt/jwt-payload.interface';
import { SendEmailService } from '../../../common/mailer/send-email.service';
import { ConfigService } from '@nestjs/config';
import { EmailConfig } from '../../../common/mailer/email-config.interface';
import * as crypto from 'crypto';
import { ForgotPasswordVerificationDto } from '../dto/reset-password.dto';
import { HashService } from '../../../common/hash/hash.service';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly sendEmailService: SendEmailService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(userDto: UserLoginDto) {
    const user = await this.userModel.findOne({ email: userDto.email });

    if (!user) {
      throw new NotFoundException('Email not found');
    }

    const isValidPassword = this.hashService.compare(
      userDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Email or Password invalid');
    }

    return user;
  }

  async register(userDto: CreateUserDto): Promise<void> {
    this.logger.log(`In func ${this.register.name}`);
    const existingUser: User = await this.userModel.findOne({
      email: userDto.email,
    });
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    userDto.password = this.hashService.hash(userDto.password);
    userDto.verification_code = this.generateVerificationCode();

    await this.userModel.create(userDto);
    await this.sendEmail({
      to: userDto.email,
      templateId: this.configService.get<string>(
        'sendgrid.verifyEmailTemplateId',
      ),
      dynamicTemplateData: {
        subject: 'Verify Email',
        code: userDto.verification_code,
      },
    });
  }

  async login(loginDto: UserLoginDto): Promise<object> {
    this.logger.log(`In func ${this.login.name}`);
    const user = await this.validateUser(loginDto);
    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
    };
    const token = this.jwtService.sign(payload);
    return { user, token };
  }

  async verify(dto: ForgotPasswordVerificationDto) {
    this.logger.log(`In func ${this.verify.name}`);

    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.verification_code !== dto.code) {
      throw new BadRequestException('Verification code invalid');
    }

    user.is_verified = true;
    user.verification_code = undefined;
    await user.save();
  }

  async forgotPassword(email: string) {
    this.logger.log(`In func ${this.forgotPassword.name}`);

    const existingUser = await this.userModel.findOne({ email });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    existingUser.reset_password_code = {
      code: this.generateVerificationCode(),
      expired_at: Date.now() + 600000,
    };

    await existingUser.save();

    await this.sendEmail({
      to: email,
      templateId: this.configService.get<string>(
        'sendgrid.forgotPasswordEmailTemplateId',
      ),
      dynamicTemplateData: {
        subject: 'Reset Password',
        code: existingUser.reset_password_code.code,
      },
    });
  }

  async verifyResetPasswordCode(
    fgPwVerificationDto: ForgotPasswordVerificationDto,
  ) {
    this.logger.log(`In func ${this.verifyResetPasswordCode.name}`);
    const existingUser = await this.userModel.findOne({
      email: fgPwVerificationDto.email,
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (existingUser.reset_password_code.expired_at < Date.now()) {
      throw new BadRequestException('Code is expired');
    }

    if (existingUser.reset_password_code.code !== fgPwVerificationDto.code) {
      throw new BadRequestException('Invalid reset password code');
    }

    const buf = crypto.randomBytes(32);
    const resetToken = buf.toString('hex');

    existingUser.reset_token = {
      token: resetToken,
      expired_at: Date.now() + 600000,
    };
    existingUser.reset_password_code = undefined;
    await existingUser.save();

    return resetToken;
  }

  async resetPassword(resetToken: string, newPassword: string) {
    this.logger.log(`In func ${this.resetPassword.name}`);
    const existingUser = await this.userModel.findOne({
      'reset_token.token': resetToken,
    });
    if (!existingUser) {
      throw new BadRequestException('Invalid token');
    }

    if (existingUser.reset_token.expired_at < Date.now()) {
      throw new BadRequestException('Token is expired');
    }

    if (existingUser.reset_token.token !== resetToken) {
      throw new BadRequestException('Invalid token');
    }

    existingUser.password = bcrypt.hashSync(newPassword, 12);
    existingUser.reset_token = undefined;
    await existingUser.save();
  }

  async loginWithGoogle(userDto: any) {
    this.logger.log(`In func ${this.loginWithGoogle.name}`);
    let user = await this.userModel.findOne({
      email: userDto.email,
      is_registered_with_google: true,
    });
    if (!user) {
      user = await this.userModel.create({
        ...userDto,
        is_registered_with_google: true,
      });
    }

    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
    };
    const token = this.jwtService.sign(payload);

    return { user: { _id: user._id, ...userDto }, token };
  }

  async loginWithGoogleAccessToken(accessToken: string) {
    this.logger.log(`In func ${this.loginWithGoogleAccessToken.name}`);
    const userDto = await this.getUserInfoFromAccessToken(accessToken);
    return await this.loginWithGoogle(userDto);
  }

  private async getUserInfoFromAccessToken(accessToken: string) {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`,
    );
    const userInfo = await response.json();
    return {
      email: userInfo.email,
      name: userInfo.name,
      avatar: userInfo.picture,
      is_verified: true,
    };
  }

  private generateVerificationCode(): string {
    const min = 0;
    const max = 99999;

    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    const verificationCode = randomNumber.toString().padStart(5, '0');

    return verificationCode;
  }

  private async sendEmail(config: EmailConfig) {
    await this.sendEmailService.sendEmailWithDynamicTemplate(config);
  }
}
