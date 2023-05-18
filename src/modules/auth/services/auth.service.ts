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
    await this.sendEmailService.sendEmailWithDynamicTemplate({
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

  private generateVerificationCode(): string {
    const min = 0;
    const max = 999999;

    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    const verificationCode = randomNumber.toString().padStart(6, '0');

    return verificationCode;
  }
}
