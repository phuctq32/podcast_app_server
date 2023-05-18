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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
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

  async register(user: CreateUserDto): Promise<void> {
    const existingUser: User = await this.userModel.findOne({
      email: user.email,
    });
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    user.password = await bcrypt.hash(user.password, 12);

    await this.userModel.create(user);

    console.log(user);
  }

  async login(payload: JwtPayload): Promise<string> {
    return this.jwtService.sign(payload);
  }
}
