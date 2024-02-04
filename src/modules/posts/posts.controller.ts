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
  Query,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { PostResponseDto } from './dto/post-response.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsAuthGuard } from '../../guards/posts-auth/posts-auth.guard';
import { PaginationDto } from './dto/pagination.dto';

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
  async getLatestPosts(@Query() paginationDto: PaginationDto) {
    paginationDto.page = paginationDto?.page || 1 
    paginationDto.pageSize = paginationDto?.pageSize || 5

    const latestPosts = await this.postsService.getLatestPosts(paginationDto);
    return {
      posts: latestPosts.slice(0, paginationDto.pageSize).map((post) => PostResponseDto.getPostResponseDto(post)),
      hasMore: latestPosts.length > paginationDto.pageSize,
      page: paginationDto.page
    };
  }
}
