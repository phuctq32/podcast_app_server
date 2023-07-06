import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateEpisodeDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  duration: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsUrl()
  href: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsUrl()
  image: string;

  @ApiProperty({
    required: false,
    description:
      'Optional - Using if user want to change the podcast of episode (changed podcast must be the same author)',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsMongoId()
  podcast_id: string;
}
