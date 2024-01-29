import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Delete,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { PostResponseDto } from './dto/post-response.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsAuthGuard } from '../../guards/posts-auth/posts-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createPost(@Request() req, @Body() createPostDto: CreatePostDto) {
    const createdPost = await this.postsService.createPost(
      req.user.userId,
      createPostDto,
    );
    console.log(createdPost);
    return PostResponseDto.getPostResponseDto(createdPost);
  }

  @UseGuards(PostsAuthGuard)
  @Put(':id')
  async updatePost(
    @Param('id') postId: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const updatedPost = await this.postsService.updatePost(
      postId,
      updatePostDto,
    );
    return PostResponseDto.getPostResponseDto(updatedPost);
  }

  @UseGuards(PostsAuthGuard)
  @Delete(':id')
  async deletePost(@Param('id') postId: string) {
    const deletedPost = await this.postsService.deletePost(postId);
    return PostResponseDto.getPostResponseDto(deletedPost);
  }

  @Get('/latest')
  async getLatestPosts() {
    const latestPosts = await this.postsService.getLatestPosts();
    return latestPosts.map((post) => PostResponseDto.getPostResponseDto(post));
  }
}
