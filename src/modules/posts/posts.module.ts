import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './post.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  controllers: [PostsController],
  providers: [PostsService, AuthGuard],
})
export class PostsModule {}
