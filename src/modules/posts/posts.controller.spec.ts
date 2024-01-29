import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { PostResponseDto } from './dto/post-response.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PostsAuthGuard } from '../../guards/posts-auth/posts-auth.guard';

jest.mock('./posts.service');

describe('PostsController', () => {
  let postsController: PostsController;
  let postsService: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [PostsService],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn().mockResolvedValue(true),
      })
      .overrideGuard(PostsAuthGuard)
      .useValue({
        canActivate: jest.fn().mockResolvedValue(true),
      })
      .compile();

    postsController = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
  });

  describe('createPost', () => {
    it('should create a new post and return a PostResponseDto', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Title',
        content: 'Test Content',
      };

      const mockUserId = 'mockUserId';
      const mockCreatedPost: any = {
        _id: 'mockPostId',
        title: 'Test Title',
        content: 'Test Content',
        author: { name: 'Mock User' },
        toObject: jest.fn().mockReturnValue({
          _id: 'mockPostId',
          title: 'Test Title',
          content: 'Test Content',
          author: { name: 'Mock User' },
        }),
      };

      jest
        .spyOn(postsService, 'createPost')
        .mockResolvedValueOnce(mockCreatedPost);

      const result = await postsController.createPost(
        { user: { userId: mockUserId } },
        createPostDto,
      );

      expect(result).toEqual(
        PostResponseDto.getPostResponseDto(mockCreatedPost),
      );
      expect(postsService.createPost).toHaveBeenCalledWith(
        mockUserId,
        createPostDto,
      );
    });

    it('should handle errors and throw BadRequestException', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Title',
        content: 'Test Content',
      };

      const mockUserId = 'mockUserId';
      const mockError = new Error('Mock Error');
      jest.spyOn(postsService, 'createPost').mockRejectedValueOnce(mockError);

      await expect(
        postsController.createPost(
          { user: { userId: mockUserId } },
          createPostDto,
        ),
      ).rejects.toThrow(
        new HttpException('Mock Error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });
});
