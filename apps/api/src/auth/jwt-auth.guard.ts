import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { FastifyRequest } from 'fastify';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest & { user?: unknown }>();
    const authorization = request.headers['authorization'] as string | undefined;
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authorization.replace('Bearer ', '');
    request.user = this.authService.verifyToken(token);
    return true;
  }
}
