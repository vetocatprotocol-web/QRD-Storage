import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { FastifyRequest } from 'fastify';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest & { user?: unknown }>();
    const authorization = request.headers['authorization'] as string | undefined;
    let token: string | undefined;

    if (authorization?.startsWith('Bearer ')) {
      token = authorization.replace('Bearer ', '');
    } else if ((request as any).cookies?.accessToken) {
      // Support HttpOnly cookie-based access token as fallback
      token = (request as any).cookies.accessToken as string | undefined;
    }

    if (!token) {
      throw new UnauthorizedException('Authorization header or accessToken cookie missing');
    }
    request.user = this.authService.verifyToken(token);
    return true;
  }
}
