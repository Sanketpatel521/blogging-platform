import { Expose, Type, plainToClass } from 'class-transformer';
import { PostDocument } from '../post.model';
import { UserResponseDto } from '../../../modules/users/dto/user-response.dto';

export class PostResponseDto {
  @Expose({ name: '_id' })
  postId: string;
  @Expose()
  title: string;
  @Expose()
  content: string;
  @Expose()
  @Type(() => UserResponseDto)
  author: UserResponseDto;

  static getPostResponseDto(post: PostDocument): PostResponseDto {
    return plainToClass(PostResponseDto, post?.toObject(), {
      strategy: 'excludeAll',
      enableImplicitConversion: true,
    });
  }
}
