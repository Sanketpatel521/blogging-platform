import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { User, UserDocument } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Model } from 'mongoose';

jest.mock('../auth/auth.service'); // Mock the AuthService

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
            find: jest.fn(),
            create: jest.fn(),
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

      await expect(usersService.createUser(createUserDto)).rejects.toThrowError(
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

      await expect(usersService.login(loginUserDto)).rejects.toThrowError(
        'Invalid email or password',
      );
    });
  });
});
