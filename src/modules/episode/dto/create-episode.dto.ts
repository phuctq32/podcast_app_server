import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateEpisodeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @Min(1000)
  duration: number;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsUrl()
  href: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  image: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  podcast_id: string;

  user_id: string;
}
