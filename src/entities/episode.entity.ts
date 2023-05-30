import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from './base.entity';
import mongoose from 'mongoose';
import { Podcast } from './podcast.entity';
import { Type } from 'class-transformer';

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

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Podcast',
    required: true,
  })
  @Type(() => Podcast)
  podcast: Podcast;
}

export const EpisodeSchema = SchemaFactory.createForClass(Episode);

export const EpisodeSchemaFactory = async () => {
  return EpisodeSchema;
};
