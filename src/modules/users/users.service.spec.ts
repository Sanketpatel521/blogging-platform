import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { User, UserDocument } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';

jest.mock('../auth/auth.service');

describe('UsersService', () => {
  let usersService: UsersService;
  let authService: AuthService;
  let userModel: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
  });

  describe('createUser', () => {
    it('should create a new user and return the created user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'test',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockCreatedUser: any = {
        _id: 'mockUserId',
        name: 'test',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);
      jest
        .spyOn(authService, 'hashPassword')
        .mockResolvedValueOnce('hashedPassword');
      jest.spyOn(userModel, 'create').mockResolvedValueOnce(mockCreatedUser);

      const result = await usersService.createUser(createUserDto);
      expect(result).toEqual(mockCreatedUser);
    });

    it('should throw an error if the user with the given email already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'test',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockExistingUser = {
        _id: 'existingUserId',
        name: 'Existing User',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(mockExistingUser);

      await expect(usersService.createUser(createUserDto)).rejects.toThrow(
        'User with that email already exists',
      );
    });
  });

  describe('login', () => {
    it('should return a token on successful login', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockFoundUser = {
        _id: 'foundUserId',
        name: 'test',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(mockFoundUser);
      jest.spyOn(authService, 'comparePassword').mockResolvedValueOnce(true);
      jest
        .spyOn(authService, 'generateJwtToken')
        .mockReturnValueOnce('mockToken');

      const result = await usersService.login(loginUserDto);
      expect(result).toEqual({ token: 'mockToken' });
    });

    it('should throw an error for invalid email or password', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);

      await expect(usersService.login(loginUserDto)).rejects.toThrow(
        'Invalid email or password',
      );
    });
  });

  describe('updateUser', () => {
    const userId = 'mockUserId';

    it('should update user and return a UserDocument of the updated user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'new test',
        email: 'newtest@example.com',
        password: 'password12345',
        oldPassword: 'password123',
      };

      const mockUser: any = {
        _id: userId,
        name: 'new test',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      const updatedUser: any = {
        ...mockUser,
        name: 'new test',
        email: 'newtest@example.com',
        password: 'hashedNewPassword',
      };

      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(mockUser);
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(authService, 'comparePassword').mockResolvedValueOnce(true);
      jest
        .spyOn(authService, 'hashPassword')
        .mockResolvedValueOnce('hashedNewPassword');
      jest
        .spyOn(userModel, 'findByIdAndUpdate')
        .mockResolvedValueOnce({ updatedUser });

      const result = await usersService.updateUser(userId, updateUserDto);
      expect(result).toEqual({ updatedUser });
    });

    it('should throw an error when updating email to an existing email', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      const mockExistingUser = {
        _id: 'existingUserId',
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'hashedPassword',
      };

      jest.spyOn(userModel, 'findById').mockResolvedValueOnce({
        ...mockExistingUser,
        _id: userId,
      });
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(mockExistingUser);

      await expect(
        usersService.updateUser(userId, updateUserDto),
      ).rejects.toThrow('Email already in use by another user');
    });

    it('should throw an error when updating password with incorrect old password', async () => {
      const updateUserDto: UpdateUserDto = {
        oldPassword: 'incorrectOldPassword',
        password: 'newPassword',
      };

      const mockUser: any = {
        _id: userId,
        name: 'test',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(mockUser);
      jest.spyOn(authService, 'comparePassword').mockResolvedValueOnce(false);

      await expect(
        usersService.updateUser(userId, updateUserDto),
      ).rejects.toThrow('Old password is incorrect');
    });

    it('should throw an error when updating a non-existent user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'new test',
      };

      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        usersService.updateUser(userId, updateUserDto),
      ).rejects.toThrow('User not found');
    });
  });

  describe('getUserById', () => {
    const userId = 'mockUserId';

    it('should return a user when a valid userId is provided', async () => {
      const mockUser: any = {
        _id: userId,
        name: 'test',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(mockUser);

      const result = await usersService.getUserById(userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw an error when the user is not found', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(null);

      await expect(usersService.getUserById(userId)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('deleteUserById', () => {
    const userId = 'mockUserId';

    it('should delete a user when a valid userId is provided', async () => {
      const mockUser: any = {
        _id: userId,
        name: 'test',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      jest
        .spyOn(userModel, 'findByIdAndDelete')
        .mockResolvedValueOnce(mockUser);

      const result = await usersService.deleteUserById(userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw an error when the user is not found', async () => {
      jest.spyOn(userModel, 'findByIdAndDelete').mockResolvedValueOnce(null);

      await expect(usersService.deleteUserById(userId)).rejects.toThrow(
        'User not found',
      );
    });
  });
});
