import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { PostResponseDto } from './dto/post-response.dto';

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
}
