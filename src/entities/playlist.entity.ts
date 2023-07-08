import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from './base.entity';
import mongoose, { HydratedDocument, PopulatedDoc, Types } from 'mongoose';
import { Exclude } from 'class-transformer';
import { ArrayClassTransform } from '../common/decorators/transform.decorator';
import { Episode, EpisodePopulatedDoc } from './episode.entity';
import { Status } from '../common/constants';

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

  calcNumEpisodes: () => Promise<void>;
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);

export const PlaylistSchemaFactory = async () => {
  const playlistSchema = PlaylistSchema;
  playlistSchema.methods.calcNumEpisodes = async function () {
    await this.populate({
      path: 'episodes',
      match: {
        status: Status.ACTIVE,
      },
    });
    this._doc.num_episodes = this.episodes.length;
    delete this._doc.episodes;
  };
  return PlaylistSchema;
};
