import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CustomError } from '../../utils/custom-error';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.authService.extractTokenFromHeader(request);
    if (!token) {
      throw new CustomError('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    try {
      const payload = await this.authService.decodeJwtToken(token);
      request['user'] = payload;
    } catch {
      throw new CustomError('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return true;
  }
}
