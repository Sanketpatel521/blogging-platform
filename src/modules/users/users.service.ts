import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './user.model';
import { AuthService } from '../auth/auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CustomError } from '../../utils/custom-error';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly authService: AuthService,
  ) {}

  async createUser(userDto: CreateUserDto): Promise<{ token: string }> {
    const existingUser = await this.userModel.findOne({ email: userDto.email });
    if (existingUser) {
      throw new CustomError(
        'User with that email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash password before saving
    userDto.password = await this.authService.hashPassword(userDto.password);
    const createdUser = await this.userModel.create(userDto);

    // Generate JWT token
    const token = this.authService.generateJwtToken({
      userId: createdUser._id.toString(),
    });
    return { token };
  }

  async login(userDto: LoginUserDto): Promise<{ token: string }> {
    const foundUser = await this.userModel.findOne({ email: userDto.email });
    if (!foundUser) {
      throw new CustomError(
        'Invalid email or password',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Compare password with hashed password
    const passwordMatch = await this.authService.comparePassword(
      userDto.password,
      foundUser.password,
    );
    if (!passwordMatch) {
      throw new CustomError(
        'Invalid email or password',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Generate JWT token
    const token = this.authService.generateJwtToken({
      userId: foundUser._id.toString(),
    });
    return { token };
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const { email, password } = updateUserDto;

    // Check if email is present in the update DTO
    if (email) {
      // Check if any user with a different userId has the same email
      const existingUser = await this.userModel.findOne({
        email,
        _id: { $ne: userId }, // Exclude the current userId from the search
      });

      // If an existing user with a different userId is found, throw an error
      if (existingUser) {
        throw new Error('Email already in use by another user');
      }
    }

    // Check if password is present in the update DTO
    if (password) {
      // Fetch the user from the database
      const user = await this.userModel.findById(userId);

      // If no user is found with the given userId, throw an error
      if (!user) {
        throw new Error('User not found');
      }

      // Compare oldPassword with the hashed password in the database
      const oldPasswordMatch = await this.authService.comparePassword(
        updateUserDto.oldPassword,
        user.password,
      );

      // If oldPassword doesn't match, throw an error
      if (!oldPasswordMatch) {
        throw new Error('Old password is incorrect');
      }

      // Hash and Update the password with the new password hash
      updateUserDto.password = await this.authService.hashPassword(password);
    }

    // Update the user
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      updateUserDto,
      {
        new: true,
      },
    );

    // If no user is found with the given userId, throw an error
    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  }

  async getUserById(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async deleteUserById(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
