import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EpisodeIdDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId({ message: 'Invalid Id' })
  episode_id: string;
}
