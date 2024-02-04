import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../users/user.model';

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  author: User;
}

export type PostDocument = Post & Document;
export const PostSchema = SchemaFactory.createForClass(Post);
