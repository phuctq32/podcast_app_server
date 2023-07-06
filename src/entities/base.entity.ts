import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BaseEntity {
  @ApiProperty()
  @Transform(({ obj }) => obj?._id?.toString(), { toClassOnly: true })
  _id?: string;
}
