import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import BaseDto from '../../../common/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDto extends BaseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  @MinLength(6)
  password: string;
}
