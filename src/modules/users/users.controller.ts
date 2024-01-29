import {
  Body,
  Controller,
  Delete,
  Get,
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
import { AuthGuard } from '../../guards/auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async create(@Body() userDto: CreateUserDto): Promise<UserResponseDto> {
    const createdUser = await this.usersService.createUser(userDto);
    return UserResponseDto.getUserResponseDto(createdUser);
  }

  @Post('login')
  async login(@Body() userDto: LoginUserDto): Promise<{ token: string }> {
    const { token } = await this.usersService.login(userDto);
    return { token };
  }

  @UseGuards(AuthGuard)
  @Put('update')
  async updateUser(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return UserResponseDto.getUserResponseDto(
      await this.usersService.updateUser(req.user.userId, updateUserDto),
    );
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getUserProfile(@Request() req) {
    return UserResponseDto.getUserResponseDto(
      await this.usersService.getUserById(req.user.userId),
    );
  }

  @UseGuards(AuthGuard)
  @Delete('delete')
  async deleteUser(@Request() req) {
    return UserResponseDto.getUserResponseDto(
      await this.usersService.deleteUserById(req.user.userId),
    );
  }
}
