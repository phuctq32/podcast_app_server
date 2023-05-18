import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import BaseDto from '../../../common/base.dto';

export default class UserLoginDto extends BaseDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  @MinLength(6)
  password: string;
}
