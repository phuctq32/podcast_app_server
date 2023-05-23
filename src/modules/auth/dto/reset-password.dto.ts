import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Match } from '../../../common/decorators/match.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @Match('password')
  confirmPassword: string;
}

export class ForgotPasswordVerificationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(5, 5)
  code: string;
}
