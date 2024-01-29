import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PostsAuthGuard } from './posts-auth.guard';
import { AuthService } from '../../modules/auth/auth.service';
import { PostsService } from '../../modules/posts/posts.service';
import { CustomError } from '../../utils/custom-error';

describe('PostsAuthGuard', () => {
  let postsAuthGuard: PostsAuthGuard;

  const mockAuthService = {
    extractTokenFromHeader: jest.fn(),
    decodeJwtToken: jest.fn(),
  };

  const mockPostsService = {
    getPostById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsAuthGuard,
        { provide: AuthService, useValue: mockAuthService },
        { provide: PostsService, useValue: mockPostsService },
      ],
    }).compile();

    postsAuthGuard = module.get<PostsAuthGuard>(PostsAuthGuard);
  });

  it('should allow access when the user is the author of the post', async () => {
    const mockContext = createContextWithTokenAndPostId(
      'valid-token',
      'user123',
      'postId',
    );

    mockAuthService.extractTokenFromHeader.mockReturnValueOnce('valid-token');
    mockAuthService.decodeJwtToken.mockReturnValueOnce({ userId: 'user123' });
    mockPostsService.getPostById.mockResolvedValueOnce({ author: 'user123' });

    const result = await postsAuthGuard.canActivate(mockContext);

    expect(result).toEqual(true);
  });

  it('should throw ForbiddenException when the user is not the author of the post', async () => {
    const mockContext = createContextWithTokenAndPostId(
      'valid-token',
      'user123',
      'postId',
    );

    mockAuthService.extractTokenFromHeader.mockReturnValueOnce('valid-token');
    mockAuthService.decodeJwtToken.mockReturnValueOnce({ userId: 'user123' });
    mockPostsService.getPostById.mockResolvedValueOnce({
      author: 'differentUser',
    });

    await expect(postsAuthGuard.canActivate(mockContext)).rejects.toThrow(
      new CustomError(
        'User not authorized to perform this action',
        HttpStatus.FORBIDDEN,
      ),
    );
  });

  it('should throw UnauthorizedException when no token is present', async () => {
    const mockContext = createContextWithTokenAndPostId(
      undefined,
      'user123',
      'postId',
    );

    await expect(postsAuthGuard.canActivate(mockContext)).rejects.toThrow(
      new CustomError('Unauthorized', HttpStatus.UNAUTHORIZED),
    );
  });

  it('should throw UnauthorizedException when token verification fails', async () => {
    const mockContext = createContextWithTokenAndPostId(
      'invalid-token',
      'user123',
      'postId',
    );

    mockAuthService.extractTokenFromHeader.mockReturnValueOnce('invalid-token');
    mockAuthService.decodeJwtToken.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    await expect(postsAuthGuard.canActivate(mockContext)).rejects.toThrow(
      new CustomError('Unauthorized', HttpStatus.UNAUTHORIZED),
    );
  });

  function createContextWithTokenAndPostId(
    token: string | undefined,
    userId: string | undefined,
    postId: string | undefined,
  ) {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: token ? `Bearer ${token}` : undefined,
          },
          params: {
            id: postId,
          },
        }),
      }),
    };

    return mockContext as any;
  }
});
