import {
  IsAlphanumeric,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MinLength,
} from 'class-validator';
import BaseDto from '../../../common/base.dto';
import { Match } from '../../../common/decorators/match.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends BaseDto {
  id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @Length(4, 30)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsUrl()
  avatar: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @MinLength(6)
  @IsAlphanumeric()
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @Match('password')
  confirmPassword: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  birthday: Date;
}
