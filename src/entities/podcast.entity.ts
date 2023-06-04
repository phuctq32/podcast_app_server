import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from './base.entity';
import mongoose, { Document, Model } from 'mongoose';
import { User } from './user.entity';
import { Transform, Type } from 'class-transformer';
import { Category } from './category.entity';
import { Episode, EpisodeDocument } from './episode.entity';

export type PodcastDocument = Podcast & Document;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
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
  @Type(() => Category)
  category: Category;

  @Prop()
  image: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  @Type(() => User)
  author: User;

  @Type(() => Episode)
  @Transform(({ value }) => ({ items: value, count: value.length }), {
    toPlainOnly: true,
  })
  episodes?: EpisodeDocument[];

  calcViews: () => Promise<void>;
}

export const PodcastSchema = SchemaFactory.createForClass(Podcast);

export const PodcastSchemaFactory = async (episodeModel: Model<Episode>) => {
  const podcastSchema = PodcastSchema;
  podcastSchema.virtual('episodes', {
    ref: Episode.name,
    localField: '_id',
    foreignField: 'podcast',
  });

  podcastSchema.methods.calcViews = async function (): Promise<void> {
    let totalViews = 0;
    const episodes = await episodeModel.find({ podcast: this._id });
    if (episodes.length > 0) {
      totalViews = episodes.reduce((res, val) => res + val.num_views, 0);
    }
    this._doc.num_views = totalViews;
  };

  return podcastSchema;
};
