import { Document, HydratedDocument } from 'mongoose';
import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User extends Document {
  @Prop({
    required: true,
  })
  email: string;

  @Prop({
    minlength: 4,
  })
  name: string;

  @Prop()
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
  verification_code: string;

  @Prop({ default: false })
  is_registered_with_google: boolean;

  @Prop({
    type: {
      code: { type: String, required: true },
      expired_at: { type: Date, required: true },
    },
  })
  //@Prop()
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
  reset_token: {
    token: string;
    expired_at: number;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
