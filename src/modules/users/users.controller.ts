import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../../guard/auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async create(@Body() userDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const createdUser = await this.usersService.createUser(userDto);
      return UserResponseDto.getUserResponseDto(createdUser);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  async login(@Body() userDto: LoginUserDto): Promise<{ token: string }> {
    try {
      const { token } = await this.usersService.login(userDto);
      return { token };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @UseGuards(AuthGuard)
  @Put('update')
  async updateUser(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    try {
      return UserResponseDto.getUserResponseDto(
        await this.usersService.updateUser(req.user.userId, updateUserDto),
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getUserProfile(@Request() req) {
    try {
      return UserResponseDto.getUserResponseDto(
        await this.usersService.getUserById(req.user.userId),
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('delete')
  async deleteUser(@Request() req) {
    try {
      return UserResponseDto.getUserResponseDto(
        await this.usersService.deleteUserById(req.user.userId),
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
