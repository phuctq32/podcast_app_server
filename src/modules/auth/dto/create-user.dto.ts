import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Expose } from 'class-transformer';
import BaseDto from '../../../common/base.dto';
import { Match } from '../../../common/decorators/match.decorator';

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
  @Match('password')
  confirmPassword: string;

  verificationCode: string;
}
