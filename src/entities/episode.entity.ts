import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from './base.entity';
import mongoose, { Document, Model } from 'mongoose';
import { Podcast } from './podcast.entity';
import { Type } from 'class-transformer';
import { UserDocument } from './user.entity';

export type EpisodeDocument = Episode & Document;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Episode extends BaseEntity {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  duration: number;

  @Prop()
  image: string;

  @Prop()
  href: string;

  @Prop({ default: 0 })
  num_views: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Podcast.name,
    required: true,
  })
  @Type(() => Podcast)
  podcast: Podcast;

  checkWatched: (userId) => Promise<void>;
}

export const EpisodeSchema = SchemaFactory.createForClass(Episode);

export const EpisodeSchemaFactory = async (userModel: Model<UserDocument>) => {
  const episodeSchema = EpisodeSchema;

  episodeSchema.methods.checkWatched = async function (userId) {
    const user = await userModel.findOne({
      _id: userId,
      watched_episodes: { $in: [this._id] },
    });
    this._doc.is_watched = !!user;
  };

  return episodeSchema;
};
