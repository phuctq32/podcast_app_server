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
  verificationCode: string;

  @Prop({ default: false })
  is_registered_with_google: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
