import { IsNotEmpty, IsOptional, IsUrl, Length } from 'class-validator';
import BaseDto from '../../../common/base.dto';
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
  birthday: Date;
}
