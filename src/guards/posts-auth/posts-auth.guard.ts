import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { PostsService } from '../../modules/posts/posts.service';
import { AuthService } from '../../modules/auth/auth.service';
import { CustomError } from '../../utils/custom-error';

@Injectable()
export class PostsAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly postsService: PostsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract the request from the execution context
    const request = context.switchToHttp().getRequest();

    // Get the post ID from the request parameters
    const postId = request.params.id;

    // Get the user ID from the JWT token
    const token = this.authService.extractTokenFromHeader(request);
    if (!token) {
      throw new CustomError('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    let userId: string;
    try {
      const payload = await this.authService.decodeJwtToken(token);
      userId = payload.userId;
    } catch {
      throw new CustomError('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    // Retrieve the post from the database using the post ID
    const post = await this.postsService.getPostById(postId);

    // Compare the author ID of the post with the user ID from the token
    // If they match, allow access; otherwise, throw an UnauthorizedException
    if (post.author.toString() === userId) {
      return true;
    } else {
      throw new CustomError(
        'User not authorized to perform this action',
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
