import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from './base.entity';
import mongoose from 'mongoose';
import { Episode } from './episode.entity';
import { Exclude, Transform, Type } from 'class-transformer';
import { User } from './user.entity';

@Schema()
export class Playlist extends BaseEntity {
  @Prop()
  name: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: Episode.name }])
  @Type(() => Episode)
  @Transform(({ value }) => ({ items: value, count: value.length }), {
    toPlainOnly: true,
  })
  episodes: Episode[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  @Exclude()
  user: User;
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);

export const PlaylistSchemaFactory = async () => {
  return PlaylistSchema;
};
