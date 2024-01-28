import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, HttpException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '../../guard/auth/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

jest.mock('./users.service'); // Mock the UsersService

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn().mockResolvedValue(true),
      })
      .compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user and return a UserResponseDto', async () => {
      const createUserDto: CreateUserDto = {
        name: 'test',
        email: 'test@example.com',
        password: 'password123',
        phoneNumber: '9876543210',
      };

      const mockCreatedUser: any = {
        _id: 'mockUserId',
        name: 'test',
        email: 'test@example.com',
        password: 'hashedPassword',
        phoneNumber: '9876543210',
        toObject: jest.fn().mockReturnValue({
          _id: 'mockUserId',
          name: 'test',
          email: 'test@example.com',
          phoneNumber: '9876543210',
          password: 'hashedPassword',
        }),
      };

      jest.spyOn(usersService, 'createUser').mockResolvedValue(mockCreatedUser);

      const expectedResponse: any = {
        name: 'test',
        email: 'test@example.com',
        phoneNumber: '9876543210',
      };

      const result = await usersController.create(createUserDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle errors and throw HttpException', async () => {
      const createUserDto: CreateUserDto = {
        name: 'test',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockError = new Error('Mock error');
      jest.spyOn(usersService, 'createUser').mockRejectedValue(mockError);

      await expect(usersController.create(createUserDto)).rejects.toThrow(
        new HttpException(mockError.message, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('login', () => {
    it('should return a token on successful login', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockToken = 'mockToken';
      jest.spyOn(usersService, 'login').mockResolvedValue({ token: mockToken });

      const result = await usersController.login(loginUserDto);
      expect(result).toEqual({ token: mockToken });
    });

    it('should handle errors and throw HttpException', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockError = new Error('Mock error');
      jest.spyOn(usersService, 'login').mockRejectedValue(mockError);

      await expect(usersController.login(loginUserDto)).rejects.toThrow(
        new HttpException(mockError.message, HttpStatus.UNAUTHORIZED),
      );
    });
  });

  describe('updateUser', () => {
    // Mock the userId which is set by AuthGuard
    const mockReq = { user: { userId: 'mockUserId' } };

    const updateUserDto: UpdateUserDto = {
      name: 'new test',
    };

    it('should update user and return a UserResponseDto of updated user', async () => {
      const expectedResponse: any = {
        name: 'new test',
        email: 'test@example.com',
        phoneNumber: '9876543210',
      };

      const mockUpdatedUser: any = {
        _id: 'mockUserId',
        name: 'new test',
        email: 'test@example.com',
        password: 'hashedPassword',
        phoneNumber: '9876543210',
        toObject: jest.fn().mockReturnValue({
          _id: 'mockUserId',
          name: 'new test',
          email: 'test@example.com',
          phoneNumber: '9876543210',
          password: 'hashedPassword',
        }),
      };

      jest.spyOn(usersService, 'updateUser').mockResolvedValue(mockUpdatedUser);

      const result = await usersController.updateUser(mockReq, updateUserDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle errors and throw HttpException', async () => {
      const mockError = new Error('Mock error');
      jest.spyOn(usersService, 'updateUser').mockRejectedValue(mockError);

      await expect(
        usersController.updateUser(mockReq, updateUserDto),
      ).rejects.toThrow(
        new HttpException(mockError.message, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('getUserProfile', () => {
    // Mock the userId which is set by AuthGuard
    const mockReq = { user: { userId: 'mockUserId' } };

    it('should get user profile and return a UserResponseDto', async () => {
      const expectedResponse: any = {
        name: 'test',
        email: 'test@example.com',
        phoneNumber: '9876543210',
      };

      const mockUserProfile: any = {
        _id: 'mockUserId',
        name: 'test',
        email: 'test@example.com',
        password: 'hashedPassword',
        phoneNumber: '9876543210',
        toObject: jest.fn().mockReturnValue({
          _id: 'mockUserId',
          name: 'test',
          email: 'test@example.com',
          phoneNumber: '9876543210',
          password: 'hashedPassword',
        }),
      };

      jest
        .spyOn(usersService, 'getUserById')
        .mockResolvedValue(mockUserProfile);

      const result = await usersController.getUserProfile(mockReq);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle errors and throw HttpException', async () => {
      const mockError = new Error('Mock error');
      jest.spyOn(usersService, 'getUserById').mockRejectedValue(mockError);

      await expect(usersController.getUserProfile(mockReq)).rejects.toThrow(
        new HttpException(mockError.message, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('deleteUser', () => {
    // Mock the userId which is set by AuthGuard
    const mockReq = { user: { userId: 'mockUserId' } };

    it('should delete user and return a UserResponseDto', async () => {
      const expectedResponse: any = {
        name: 'test',
        email: 'test@example.com',
        phoneNumber: '9876543210',
      };

      const mockDeletedUser: any = {
        _id: 'mockUserId',
        name: 'test',
        email: 'test@example.com',
        password: 'hashedPassword',
        phoneNumber: '9876543210',
        toObject: jest.fn().mockReturnValue({
          _id: 'mockUserId',
          name: 'test',
          email: 'test@example.com',
          phoneNumber: '9876543210',
          password: 'hashedPassword',
        }),
      };

      jest
        .spyOn(usersService, 'deleteUserById')
        .mockResolvedValue(mockDeletedUser);

      const result = await usersController.deleteUser(mockReq);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle errors and throw HttpException', async () => {
      const mockError = new Error('Mock error');
      jest.spyOn(usersService, 'deleteUserById').mockRejectedValue(mockError);

      await expect(usersController.deleteUser(mockReq)).rejects.toThrow(
        new HttpException(mockError.message, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });
});
