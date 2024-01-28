import { Expose, plainToClass } from 'class-transformer';
import { UserDocument } from '../user.model';

export class UserResponseDto {
  @Expose()
  name: string;
  @Expose()
  email: string;
  @Expose()
  phoneNumber: string;
  @Expose()
  address: string;

  static getUserResponseDto(user: UserDocument): UserResponseDto {
    return plainToClass(UserResponseDto, user?.toObject(), {
      strategy: 'excludeAll',
    });
  }
}
