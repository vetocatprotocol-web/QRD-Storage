import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { AuthTokens, JwtPayload } from '@qrd/shared-types';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(payload: RegisterDto): Promise<AuthTokens> {
    const existing = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await argon2.hash(payload.password);
    const user = await this.prisma.user.create({
      data: {
        email: payload.email,
        passwordHash,
        firstName: payload.firstName,
        lastName: payload.lastName,
      },
    });

    return this.generateTokens(user.id, user.email);
  }

  async login(payload: LoginDto): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (!user || !(await argon2.verify(user.passwordHash, payload.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateTokens(user.id, user.email);
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    const isValid = await argon2.verify(user.refreshTokenHash, refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    return this.generateTokens(user.id, user.email);
  }

  async logout(userId: string): Promise<void> {
    // Remove stored refresh token hash to revoke refresh capability for the device/user.
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
  }

  private async generateTokens(userId: string, email: string): Promise<AuthTokens> {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    const accessToken = jwt.sign({ sub: userId, email }, secret, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ sub: userId, email }, secret, {
      expiresIn: '7d',
    });

    const refreshTokenHash = await argon2.hash(refreshToken);
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash } });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  verifyToken(token: string): JwtPayload {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET environment variable is required');
      }

      return jwt.verify(token, secret) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
