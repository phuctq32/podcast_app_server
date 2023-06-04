import mongoose, { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { BaseEntity } from './base.entity';
import { Episode } from './episode.entity';

export type UserDocument = User & Document;

@Schema()
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
  password?: string;

  @Prop({
    default:
      'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
  })
  avatar: string;

  @Prop()
  birthday?: Date;

  @Prop({ default: false })
  is_verified: boolean;

  @Prop()
  channel_name: string;

  @Prop({ default: false })
  @Exclude()
  is_creator: boolean;

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

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Episode.name }],
  })
  @Exclude()
  watched_episodes: Episode[];
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserSchemaFactory = async () => {
  return UserSchema;
};
