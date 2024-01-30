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

  describe('getAllPosts', () => {
    it('should return an array of PostResponseDto', async () => {
      const mockPosts: any[] = [
        {
          _id: '1',
          title: 'Post 1',
          content: 'Content 1',
          author: { name: 'User 1' },
          toObject: jest.fn().mockReturnValue({
            _id: '1',
            title: 'Post 1',
            content: 'Content 1',
            author: { name: 'User 1' },
          }),
        },
        {
          _id: '2',
          title: 'Post 2',
          content: 'Content 2',
          author: { name: 'User 2' },
          toObject: jest.fn().mockReturnValue({
            _id: '1',
            title: 'Post 1',
            content: 'Content 1',
            author: { name: 'User 1' },
          }),
        },
      ];

      jest
        .spyOn(postsService, 'getLatestPosts')
        .mockResolvedValueOnce(mockPosts);

      const result = await postsController.getLatestPosts();

      expect(result).toEqual(
        mockPosts.map((post) => PostResponseDto.getPostResponseDto(post)),
      );
      expect(postsService.getLatestPosts).toHaveBeenCalled();
    });

    it('should handle errors and throw InternalServerError', async () => {
      const mockError = new Error('Mock Error');
      jest
        .spyOn(postsService, 'getLatestPosts')
        .mockRejectedValueOnce(mockError);

      await expect(postsController.getLatestPosts()).rejects.toThrow(
        new HttpException('Mock Error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('updatePost', () => {
    it('should update the specified post and return a PostResponseDto', async () => {
      const postId = 'mockPostId';
      const updatePostDto = {
        title: 'Updated Title',
        content: 'Updated Content',
      };
      const mockUpdatedPost: any = {
        _id: postId,
        ...updatePostDto,
        author: { name: 'Mock User' },
        createdAt: new Date('2024-01-30T00:00:00Z'),
        toObject: jest.fn().mockReturnValue({
          _id: postId,
          ...updatePostDto,
          author: { name: 'Mock User' },
          createdAt: new Date('2024-01-30T00:00:00Z'),
        }),
      };

      jest
        .spyOn(postsService, 'updatePost')
        .mockResolvedValueOnce(mockUpdatedPost);

      const result = await postsController.updatePost(postId, updatePostDto);

      expect(result).toEqual(
        PostResponseDto.getPostResponseDto(mockUpdatedPost),
      );
      expect(postsService.updatePost).toHaveBeenCalledWith(
        postId,
        updatePostDto,
      );
    });

    it('should handle errors and throw NotFoundException', async () => {
      const postId = 'nonexistentPostId';
      const updatePostDto = {
        title: 'Updated Title',
        content: 'Updated Content',
      };
      const mockError = new Error('Post not found');
      jest.spyOn(postsService, 'updatePost').mockRejectedValueOnce(mockError);

      await expect(
        postsController.updatePost(postId, updatePostDto),
      ).rejects.toThrow(
        new HttpException('Post not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('deletePost', () => {
    it('should delete the specified post and return a PostResponseDto', async () => {
      const postId = 'mockPostId';
      const mockDeletedPost: any = {
        _id: postId,
        title: 'Deleted Post',
        content: 'Deleted Content',
        author: { name: 'Mock User' },
        createdAt: new Date('2024-01-30T00:00:00Z'),
        toObject: jest.fn().mockReturnValue({
          _id: postId,
          title: 'Deleted Post',
          content: 'Deleted Content',
          author: { name: 'Mock User' },
          createdAt: new Date('2024-01-30T00:00:00Z'),
        }),
      };

      jest
        .spyOn(postsService, 'deletePost')
        .mockResolvedValueOnce(mockDeletedPost);

      const result = await postsController.deletePost(postId);

      expect(result).toEqual(
        PostResponseDto.getPostResponseDto(mockDeletedPost),
      );
      expect(postsService.deletePost).toHaveBeenCalledWith(postId);
    });

    it('should handle errors and throw NotFoundException', async () => {
      const postId = 'nonexistentPostId';
      const mockError = new Error('Post not found');
      jest.spyOn(postsService, 'deletePost').mockRejectedValueOnce(mockError);

      await expect(postsController.deletePost(postId)).rejects.toThrow(
        new HttpException('Post not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
