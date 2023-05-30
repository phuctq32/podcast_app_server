import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from './base.entity';
import mongoose, { Document } from 'mongoose';
import { User } from './user.entity';
import { Transform, Type } from 'class-transformer';
import { Category } from './category.entity';
import { Episode } from './episode.entity';

export type PodcastDocument = Podcast & Document;

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

  @Prop()
  category: Category;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  @Type(() => User)
  author: User;

  @Type(() => Episode)
  @Transform(({ value }) =>
    value.items ? value : { items: value, count: value.length },
  )
  episodes?: Episode[];
}

export const PodcastSchema = SchemaFactory.createForClass(Podcast);

export const PodcastSchemaFactory = async () => {
  const podcastSchema = PodcastSchema;
  podcastSchema.virtual('episodes', {
    ref: 'Episode',
    localField: '_id',
    foreignField: 'podcast',
  });

  return podcastSchema;
};
