import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

jest.mock('@nestjs/jwt');
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, JwtService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('hashPassword', () => {
    it('should hash the password', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('hashedPassword');
      const result = await authService.hashPassword('password123');
      expect(result).toEqual('hashedPassword');
    });
  });

  describe('comparePassword', () => {
    it('should compare the candidate password with the hashed password', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
      const result = await authService.comparePassword(
        'password123',
        'hashedPassword',
      );
      expect(result).toBe(true);
    });
  });

  describe('generateJwtToken', () => {
    it('should generate a JWT token', () => {
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('mockToken');
      const result = authService.generateJwtToken({ userId: 'mockUserId' });
      expect(result).toEqual('mockToken');
    });
  });

  describe('decodeJwtToken', () => {
    it('should decode a JWT token', async () => {
      const mockDecodedToken = { userId: 'mockUserId' };
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValueOnce(mockDecodedToken);
      const result = await authService.decodeJwtToken('mockToken');
      expect(result).toEqual(mockDecodedToken);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract the token from the Authorization header', () => {
      const request: any = { headers: { authorization: 'Bearer testToken' } };
      const result = authService.extractTokenFromHeader(request);

      expect(result).toEqual('testToken');
    });

    it('should return undefined if Authorization header is missing', () => {
      const request: any = { headers: {} };
      const result = authService.extractTokenFromHeader(request);

      expect(result).toBeUndefined();
    });

    it('should return undefined if Authorization header is malformed', () => {
      const request: any = { headers: { authorization: 'InvalidFormat' } };
      const result = authService.extractTokenFromHeader(request);

      expect(result).toBeUndefined();
    });
  });
});
