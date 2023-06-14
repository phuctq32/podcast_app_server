import { Transform } from 'class-transformer';

export class BaseEntity {
  @Transform(({ obj }) => obj?._id?.toString(), { toClassOnly: true })
  _id?: string;
}
