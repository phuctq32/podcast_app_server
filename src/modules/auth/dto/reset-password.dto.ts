import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Match } from '../../../common/decorators/match.decorator';
import BaseDto from '../../../common/base.dto';
import { Expose } from 'class-transformer';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  password: string;

  @IsNotEmpty()
  @Match('password')
  confirmPassword: string;
}

export class ForgotPasswordVerificationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  code: string;
}
