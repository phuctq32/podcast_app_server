import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model, PopulatedDoc } from 'mongoose';
import { ClassTransform } from '../common/decorators/transform.decorator';
import { BaseEntity } from './base.entity';
import { Podcast, PodcastPopulatedDoc } from './podcast.entity';
import { UserDocument } from './user.entity';

export type EpisodeDocument = HydratedDocument<Episode>;
export type EpisodePopulatedDoc = PopulatedDoc<EpisodeDocument>;

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
    ref: 'Podcast',
    required: true,
  })
  @ClassTransform(() => Podcast)
  podcast: PodcastPopulatedDoc;

  checkListened: (userId) => Promise<void>;
}

export const EpisodeSchema = SchemaFactory.createForClass(Episode);

export const EpisodeSchemaFactory = async (userModel: Model<UserDocument>) => {
  const episodeSchema = EpisodeSchema;

  episodeSchema.methods.checkListened = async function (userId) {
    const user = await userModel.findOne({
      _id: userId,
      listened_episodes: { $in: [this._id] },
    });
    this._doc.is_listened = !!user;
  };

  return episodeSchema;
};
