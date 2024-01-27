import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './user.model';
import { AuthService } from '../auth/auth.service';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly authService: AuthService,
  ) {}

  async createUser(userDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: userDto.email });
    if (existingUser) {
      throw new Error('User with that email already exists');
    }

    // Hash password before saving
    userDto.password = await this.authService.hashPassword(userDto.password);
    const createdUser = new this.userModel(userDto);
    return await createdUser.save();
  }

  async login(userDto: LoginUserDto): Promise<{ token: string }> {
    const foundUser = await this.userModel.findOne({ email: userDto.email });
    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    // Compare password with hashed password
    const passwordMatch = await this.authService.comparePassword(
      userDto.password,
      foundUser.password,
    );
    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.authService.generateJwtToken({
      userId: foundUser._id.toString(),
    });
    return { token };
  }
}
