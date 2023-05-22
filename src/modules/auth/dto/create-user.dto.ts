import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Expose } from 'class-transformer';
import BaseDto from '../../../common/base.dto';
import { Match } from '../../../common/decorators/match.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto extends BaseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsAlphanumeric()
  @MinLength(6)
  @Expose()
  password: string;

  @ApiProperty()
  @IsString()
  @Match('password')
  confirmPassword: string;

  verificationCode: string;
}
