import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { Post, PostDocument } from './post.model';
import { CustomError } from '../../utils/custom-error';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async createPost(
    userId: string,
    createPostDto: CreatePostDto,
  ): Promise<PostDocument> {
    const postData = { ...createPostDto, author: userId };
    const post = await this.postModel.create(postData);
    return await post.populate('author', 'name');
  }

  async getPostById(postId: string): Promise<PostDocument> {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new CustomError('Post not found', HttpStatus.NOT_FOUND);
    }

    return post;
  }

  async updatePost(
    postId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<PostDocument> {
    const updatedPost = await this.postModel
      .findByIdAndUpdate(postId, updatePostDto, { new: true })
      .populate('author', 'name');

    if (!updatedPost) {
      throw new CustomError('Post not found', HttpStatus.NOT_FOUND);
    }

    return updatedPost;
  }

  async deletePost(postId: string): Promise<PostDocument> {
    const deletedPost = await this.postModel.findByIdAndDelete(postId);

    if (!deletedPost) {
      throw new CustomError('Post not found', HttpStatus.NOT_FOUND);
    }

    return deletedPost;
  }
  async getLatestPosts(paginationDto: PaginationDto): Promise<Post[]> {
    const { page, pageSize } = paginationDto;

    return await this.postModel
      .find()
      .sort({ createdAt: -1 })
      .populate('author', 'name')
      .skip((page - 1) * pageSize)
      .limit(pageSize + 1);
    
  }
}
