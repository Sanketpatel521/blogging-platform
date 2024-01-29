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
            findById: jest.fn(),
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
      jest.spyOn(mockCreatedPost, 'populate').mockResolvedValueOnce({
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

      await expect(
        postsService.createPost(mockUserId, createPostDto),
      ).rejects.toThrow(
        new HttpException('Mock Error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('getPostById', () => {
    it('should return a post when found', async () => {
      const mockPost = {
        _id: 'mockPostId',
        title: 'Test Title',
        content: 'Test Content',
        author: 'mockUserId',
      };

      jest.spyOn(postModel, 'findById').mockResolvedValueOnce(mockPost);

      const result = await postsService.getPostById('postId');

      expect(result).toEqual(mockPost);
      expect(postModel.findById).toHaveBeenCalledWith('postId');
    });

    it('should throw NotFoundException when post is not found', async () => {
      jest.spyOn(postModel, 'findById').mockResolvedValueOnce(null);

      await expect(postsService.getPostById('nonexistentId')).rejects.toThrow(
        new HttpException('Post not found', HttpStatus.NOT_FOUND),
      );

      expect(postModel.findById).toHaveBeenCalledWith('nonexistentId');
    });
  });
});
