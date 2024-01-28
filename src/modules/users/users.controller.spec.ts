import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, HttpException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

jest.mock('./users.service'); // Mock the UsersService

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

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
});
