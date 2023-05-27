import { ApiProperty } from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Match } from '../../../common/decorators/match.decorator';

export class ChangePasswordUserDto {
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  @IsAlphanumeric()
  newPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @Match('newPassword')
  confirmNewPassword: string;
}
