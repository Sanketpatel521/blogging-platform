import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { Post, PostDocument } from './post.model';
import { CreatePostDto } from './dto/create-post.dto';
import { Model } from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('PostsService', () => {
  let postsService: PostsService;
  let postModel: Model<PostDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getModelToken(Post.name),
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    postsService = module.get<PostsService>(PostsService);
    postModel = module.get<Model<PostDocument>>(getModelToken(Post.name));
  });

  describe('createPost', () => {
    it('should create a new post and return the created post', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Title',
        content: 'Test Content',
      };

      const mockUserId = 'mockUserId';
      const mockCreatedPost: any = {
        _id: 'mockPostId',
        title: 'Test Title',
        content: 'Test Content',
        author: mockUserId,
        populate: jest.fn(),
      };
      const mockPopulatePost: any = {
        ...mockCreatedPost,
        author: { name: 'Mock User' },
      };

      jest.spyOn(postModel, 'create').mockResolvedValueOnce(mockCreatedPost);
      jest
        .spyOn(mockCreatedPost, 'populate')
        .mockResolvedValueOnce({
          ...mockCreatedPost,
          author: { name: 'Mock User' },
        });
      const result = await postsService.createPost(mockUserId, createPostDto);

      expect(result).toEqual(mockPopulatePost);
      expect(postModel.create).toHaveBeenCalledWith({
        ...createPostDto,
        author: mockUserId,
      });
    });

    it('should throw BadRequestException if post creation fails', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Title',
        content: 'Test Content',
      };

      const mockUserId = 'mockUserId';
      const mockError = new Error('Mock Error');
      jest.spyOn(postModel, 'create').mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(
        postsService.createPost(mockUserId, createPostDto),
      ).rejects.toThrow(
        new HttpException('Mock Error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });
});
