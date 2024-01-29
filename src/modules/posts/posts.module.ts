import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './post.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { PostsAuthGuard } from '../../guards/posts-auth/posts-auth.guard';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  controllers: [PostsController],
  providers: [PostsService, AuthService, AuthGuard, PostsAuthGuard],
})
export class PostsModule {}
