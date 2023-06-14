import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from './base.entity';
import mongoose, { HydratedDocument, PopulatedDoc, Types } from 'mongoose';
import { Exclude } from 'class-transformer';
import { ArrayClassTransform } from '../common/decorators/transform.decorator';
import { Episode, EpisodePopulatedDoc } from './episode.entity';

export type PlaylistDocument = HydratedDocument<Playlist>;
export type PlaylistPopulatedDoc = PopulatedDoc<PlaylistDocument>;

@Schema()
export class Playlist extends BaseEntity {
  @Prop()
  name: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Episode' }])
  @ArrayClassTransform(() => Episode)
  episodes: EpisodePopulatedDoc[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Exclude()
  user: Types.ObjectId;
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);

export const PlaylistSchemaFactory = async () => {
  return PlaylistSchema;
};
