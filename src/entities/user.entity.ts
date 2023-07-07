import mongoose, { HydratedDocument, PopulatedDoc } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { BaseEntity } from './base.entity';
import { EpisodePopulatedDoc } from './episode.entity';
import { Podcast, PodcastPopulatedDoc } from './podcast.entity';
import { ArrayClassTransform } from '../common/decorators/transform.decorator';
import { DEFAULT_AVATAR_URL } from '../common/constants';

export type UserDocument = HydratedDocument<User>;
export type UserPopulatedDoc = PopulatedDoc<User>;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User extends BaseEntity {
  @Prop({
    required: true,
  })
  email: string;

  @Prop({
    minlength: 4,
  })
  name: string;

  @Prop()
  @Exclude()
  password: string;

  @Prop({
    default: DEFAULT_AVATAR_URL,
  })
  avatar: string;

  @Prop()
  birthday: Date;

  @Prop({ default: false })
  is_verified: boolean;

  @Prop({ type: [String] })
  @Exclude()
  search_history: string[];

  /**
   * When user register to be a creator, channel_name is required.
   * If user is not creator, channel_name is undefined
   */
  @Prop({ default: null })
  channel_name: string;

  /**
   *  To check if user is a creator
   */
  @Prop({ default: false })
  is_creator: boolean;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Episode' }],
  })
  @Exclude()
  favorite_episodes: EpisodePopulatedDoc[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Episode' }],
  })
  @Exclude()
  listened_episodes: EpisodePopulatedDoc[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Podcast' }],
  })
  @Exclude()
  subscribed_podcasts: PodcastPopulatedDoc[];

  /**
   * Properties for authentication function
   */
  @Prop()
  @Exclude()
  verification_code: string;

  @Prop({ default: false })
  @Exclude()
  is_registered_with_google: boolean;

  @Prop({
    type: {
      code: { type: String, required: true },
      expired_at: { type: Date, required: true },
    },
  })
  @Exclude()
  reset_password_code: {
    code: string;
    expired_at: number;
  };

  @Prop({
    type: {
      token: { type: String, required: true },
      expired_at: { type: Date, required: true },
    },
  })
  @Exclude()
  reset_token: {
    token: string;
    expired_at: number;
  };

  @ArrayClassTransform(() => Podcast)
  podcasts: PodcastPopulatedDoc[];
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserSchemaFactory = async () => {
  const userSchema = UserSchema;

  userSchema.virtual('podcasts', {
    ref: 'Podcast',
    localField: '_id',
    foreignField: 'author',
  });
  return UserSchema;
};
