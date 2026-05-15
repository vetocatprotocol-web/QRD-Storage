import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import type { FastifyReply } from 'fastify';
import type { RefreshTokenDto } from '@qrd/shared-types';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { FastifyRequest } from 'fastify';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto, @Res({ passthrough: true }) reply: FastifyReply) {
    const tokens = await this.authService.register(body);
    // Set HttpOnly cookies for access and refresh tokens. Frontend should not store tokens in localStorage.
    reply.setCookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: tokens.expiresIn,
    });

    reply.setCookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth',
      // refresh token expiration in seconds (7 days)
      maxAge: 7 * 24 * 60 * 60,
    });

    return { status: 'ok' };
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) reply: FastifyReply) {
    const tokens = await this.authService.login(body);

    reply.setCookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: tokens.expiresIn,
    });

    reply.setCookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth',
      maxAge: 7 * 24 * 60 * 60,
    });

    return { status: 'ok' };
  }

  @Post('refresh')
  async refresh(@Res({ passthrough: true }) reply: FastifyReply, @Body() body?: { userId?: string; refreshToken?: string }) {
    // Prefer refresh token from HttpOnly cookie; fall back to body if provided (rare).
    const refreshTokenFromCookie = (reply as unknown as { request?: any }).request?.cookies?.refreshToken;
    const refreshToken = refreshTokenFromCookie || body?.refreshToken;
    const userId = body?.userId;

    if (!refreshToken || !userId) {
      return {
        status: 'error',
        message: 'Missing refresh token or userId',
      };
    }

    const tokens = await this.authService.refreshTokens(userId, refreshToken);

    reply.setCookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: tokens.expiresIn,
    });

    reply.setCookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth',
      maxAge: 7 * 24 * 60 * 60,
    });

    return { status: 'ok' };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() request: FastifyRequest & { user: { sub: string } }, @Res({ passthrough: true }) reply: FastifyReply) {
    await this.authService.logout(request.user.sub);

    // Clear auth cookies
    reply.clearCookie('accessToken', { path: '/' });
    reply.clearCookie('refreshToken', { path: '/auth' });

    return { status: 'ok' };
  }
}
