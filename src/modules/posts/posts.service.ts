import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { Post, PostDocument } from './post.model';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async createPost(
    userId: string,
    createPostDto: CreatePostDto,
  ): Promise<PostDocument> {
    const postData = { ...createPostDto, author: userId };
    const post = await this.postModel.create(postData);
    return await post.populate('author', 'name -_id');
  }
}
