import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  name: string;
  @Expose()
  email: string;
  @Expose()
  phoneNumber: string;
  @Expose()
  address: string;
}
