import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToClass } from 'class-transformer';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async create(@Body() userDto: CreateUserDto): Promise<UserResponseDto> {
    const createdUser = await this.usersService.createUser(userDto);
    return plainToClass(UserResponseDto, createdUser?.toObject(), {
      strategy: 'excludeAll',
    });
  }

  @Post('login')
  async login(@Body() userDto: LoginUserDto): Promise<{ token: string }> {
    const { token } = await this.usersService.login(userDto);
    return { token };
  }
}
