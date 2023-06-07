import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model, PopulatedDoc } from 'mongoose';
import {
  ArrayClassTransform,
  ClassTransform,
} from '../common/decorators/transform.decorator';
import { User, UserPopulatedDoc } from './user.entity';
import { BaseEntity } from './base.entity';
import { Category, CategoryPopulatedDoc } from './category.entity';
import { Episode, EpisodePopulatedDoc } from './episode.entity';

export type PodcastDocument = Podcast & HydratedDocument<any>;
export type PodcastPopulatedDoc = PopulatedDoc<PodcastDocument>;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Podcast extends BaseEntity {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Category.name,
  })
  @ClassTransform(() => Category)
  category: CategoryPopulatedDoc;

  @Prop()
  image: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  @ClassTransform(() => User)
  author: UserPopulatedDoc;

  @ArrayClassTransform(() => Episode)
  episodes: EpisodePopulatedDoc[];

  calcViews: () => Promise<void>;
}

export const PodcastSchema = SchemaFactory.createForClass(Podcast);

export const PodcastSchemaFactory = async (
  episodeModel: Model<Episode>,
  userModel: Model<User>,
) => {
  const podcastSchema = PodcastSchema;
  podcastSchema.virtual('episodes', {
    ref: Episode.name,
    localField: '_id',
    foreignField: 'podcast',
  });

  /**
   * Calculate the total views of podcast
   */
  podcastSchema.methods.calcViews = async function (): Promise<void> {
    let totalViews = 0;
    const episodes = await episodeModel.find({ podcast: this._id });
    if (episodes.length > 0) {
      totalViews = episodes.reduce((res, val) => res + val.num_views, 0);
    }
    this._doc.num_views = totalViews;
  };

  podcastSchema.methods.checkSubscription = async function (
    userId: string,
  ): Promise<void> {
    const user = await userModel.findOne({
      _id: userId,
      subscribed_podcasts: { $in: [this._id] },
    });

    this._doc.is_subcribed = !!user;
  };

  return podcastSchema;
};
