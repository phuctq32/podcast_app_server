import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AddEpisodeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  episode_id: string;

  user_id: string;
  playlist_id: string;
}
