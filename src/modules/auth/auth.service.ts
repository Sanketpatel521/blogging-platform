import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(
    candidatePassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  generateJwtToken(payload: { userId: string }): string {
    return this.jwtService.sign(payload);
  }

  async decodeJwtToken(token: string): Promise<any> {
    const decoded = await this.jwtService.verifyAsync(token);
    return decoded;
  }
}
