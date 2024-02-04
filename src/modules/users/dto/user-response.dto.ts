import { Expose, plainToClass } from 'class-transformer';
import { UserDocument } from '../user.model';
import { Types } from 'mongoose';

export class UserResponseDto {
  @Expose({ name: '_id' })
  userId: string;
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
      enableImplicitConversion: true,
    });
  }
}
