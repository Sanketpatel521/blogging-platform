import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Post } from '../posts/post.model';

@Schema()
export class User extends Document {
  @Prop()
  name: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop()
  phoneNumber: string;
  @Prop()
  address: string;
  @Prop({ type: Types.ObjectId, ref: 'Post' })
  posts: Post[];
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
