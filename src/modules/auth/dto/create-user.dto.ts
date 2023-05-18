import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Expose } from 'class-transformer';
import BaseDto from '../../../common/base.dto';

export class CreateUserDto extends BaseDto {
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email: string;

  @IsNotEmpty()
  @IsAlphanumeric()
  @MinLength(6)
  @Expose()
  password: string;

  @IsString()
  confirmPassword: string;

  verificationCode: string;
}
