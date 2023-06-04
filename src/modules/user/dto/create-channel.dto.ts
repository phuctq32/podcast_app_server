import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChannelDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  userId: string;
}
