import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import UserLoginDto from '../dto/user-login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../../common/jwt/jwt-payload.interface';
import { SendEmailService } from '../../../common/mailer/send-email.service';
import { ConfigService } from '@nestjs/config';
import { EmailConfig } from '../../../common/mailer/email-config.interface';
import * as crypto from 'crypto';
import { ForgotPasswordVerificationDto } from '../dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly sendEmailService: SendEmailService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(userDto: UserLoginDto) {
    const user = await this.userModel.findOne({ email: userDto.email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValidPassword = await bcrypt.compare(
      userDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new BadRequestException({
        status: HttpStatus.UNAUTHORIZED,
        error: 'Password incorrect',
      });
    }

    // if (!user.is_verified) {
    //   throw new BadRequestException({
    //     status: HttpStatus.UNAUTHORIZED,
    //     error: 'User not verified',
    //   });
    // }

    return user;
  }

  async register(userDto: CreateUserDto): Promise<void> {
    console.log(userDto);
    const existingUser: User = await this.userModel.findOne({
      email: userDto.email,
    });
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    userDto.password = await bcrypt.hash(userDto.password, 12);
    userDto.verificationCode = this.generateVerificationCode();

    await this.userModel.create(userDto);
    await this.sendEmail({
      to: userDto.email,
      templateId: this.configService.get<string>(
        'sendgrid.verifyEmailTemplateId',
      ),
      dynamicTemplateData: {
        subject: 'Verify Email',
        code: userDto.verificationCode,
      },
    });
  }

  async login(payload: JwtPayload): Promise<string> {
    return this.jwtService.sign(payload);
  }

  async verify(userId: string, verificationCode: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.verification_code !== verificationCode) {
      throw new BadRequestException('Verification code invalid');
    }

    user.is_verified = true;
    user.verification_code = undefined;
    await user.save();
  }

  async forgotPassword(email: string) {
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
