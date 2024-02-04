import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { Post, PostDocument } from './post.model';
import { CreatePostDto } from './dto/create-post.dto';
import { Model } from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PaginationDto } from './dto/pagination.dto';

describe('PostsService', () => {
  let postsService: PostsService;
  let postModel: Model<PostDocument>;

  const mockPosts: any = [
    {
      _id: '1',
      title: 'Post 1',
      content: 'Content 1',
      createdAt: new Date('2024-01-30T00:00:00Z'),
      author: { name: 'User 1', userId: 'mockUserId' },
    },
    {
      _id: '2',
      title: 'Post 2',
      content: 'Content 2',
      createdAt: new Date('2024-01-29T00:00:00Z'),
      author: { name: 'User 2', userId: 'mockUserId' },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getModelToken(Post.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn().mockReturnThis(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn().mockReturnThis(),
            findByIdAndDelete: jest.fn(),
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn(() => mockPosts),
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
        createdAt: new Date('2024-01-30T00:00:00Z'),
      };
      const mockPopulatePost: any = {
        ...mockCreatedPost,
        author: { name: 'Mock User', userid: mockUserId },
      };

      jest.spyOn(postModel, 'create').mockResolvedValueOnce(mockCreatedPost);
      jest.spyOn(mockCreatedPost, 'populate').mockResolvedValueOnce({
        ...mockCreatedPost,
        author: { name: 'Mock User', userid: mockUserId },
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
        createdAt: new Date('2024-01-30T00:00:00Z'),
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

  describe('updatePost', () => {
    it('should update a post and return the updated post', async () => {
      const mockUpdatedPost: any = {
        _id: 'mockPostId',
        title: 'Updated Title',
        content: 'Updated Content',
        author: 'mockUserId',
        createdAt: new Date('2024-01-30T00:00:00Z'),
      };

      jest.spyOn(postModel, 'populate').mockResolvedValueOnce({
        ...mockUpdatedPost,
        author: { name: 'Mock User', userId: 'mockUserId' },
      });
      const result = await postsService.updatePost('postId', {
        title: 'Updated Title',
        content: 'Updated Content',
      });

      expect(result).toEqual({
        ...mockUpdatedPost,
        author: { name: 'Mock User', userId: 'mockUserId' },
      });
      expect(postModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'postId',
        { title: 'Updated Title', content: 'Updated Content' },
        { new: true },
      );
    });

    it('should throw NotFoundException when post is not found during update', async () => {
      jest.spyOn(postModel, 'populate').mockResolvedValueOnce(null);

      await expect(
        postsService.updatePost('nonexistentId', {
          title: 'Updated Title',
          content: 'Updated Content',
        }),
      ).rejects.toThrow(
        new HttpException('Post not found', HttpStatus.NOT_FOUND),
      );

      expect(postModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'nonexistentId',
        { title: 'Updated Title', content: 'Updated Content' },
        { new: true },
      );
    });
  });

  describe('deletePost', () => {
    it('should delete a post and return the deleted post', async () => {
      const mockDeletedPost: any = {
        _id: 'mockPostId',
        title: 'Test Title',
        content: 'Test Content',
        author: 'mockUserId',
        createdAt: new Date('2024-01-30T00:00:00Z'),
      };

      jest
        .spyOn(postModel, 'findByIdAndDelete')
        .mockResolvedValueOnce(mockDeletedPost);

      const result = await postsService.deletePost('postId');

      expect(result).toEqual(mockDeletedPost);
      expect(postModel.findByIdAndDelete).toHaveBeenCalledWith('postId');
    });

    it('should throw NotFoundException when post is not found during deletion', async () => {
      jest.spyOn(postModel, 'findByIdAndDelete').mockResolvedValueOnce(null);

      await expect(postsService.deletePost('nonexistentId')).rejects.toThrow(
        new HttpException('Post not found', HttpStatus.NOT_FOUND),
      );

      expect(postModel.findByIdAndDelete).toHaveBeenCalledWith('nonexistentId');
    });
  });

  describe('getLatestPosts', () => {
    it('should return an array of PostDocument in descending order of creation', async () => {
      const mockPaginationDto: PaginationDto = {
        pageSize: 2,
        page: 1,
      };

      const result = await postsService.getLatestPosts(mockPaginationDto);

      expect(result).toEqual(mockPosts);
      expect(postModel.find).toHaveBeenCalledWith();
    });
  });
});
