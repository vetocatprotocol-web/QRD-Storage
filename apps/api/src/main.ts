import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';

async function bootstrap() {
  // Validate critical environment variables early to avoid insecure defaults.
  if (!process.env.JWT_SECRET) {
    // Fail fast in CI / production if JWT secret is missing.
    console.error('FATAL: JWT_SECRET is not set. Exiting.');
    process.exit(1);
  }

  if (!process.env.CORS_ORIGIN) {
    console.error('FATAL: CORS_ORIGIN is not set. Exiting.');
    process.exit(1);
  }

  const corsOrigins = process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  // Versioned API prefix
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();

  // Tighten CORS using configured whitelist and allow credentials for cookie auth.
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Register Fastify plugins for cookies, security headers, and rate limiting.
  const fastify = app.getHttpAdapter().getInstance() as any;
  // Cookie plugin: used to set HttpOnly cookies for auth tokens.
  await fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || process.env.JWT_SECRET,
  });

  // Helmet plugin for security headers (CSP disabled by default to avoid breaking clients).
  await fastify.register(fastifyHelmet, { contentSecurityPolicy: false });

  // Basic rate limiting to protect auth endpoints and abusive clients.
  await fastify.register(fastifyRateLimit, {
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    timeWindow: '1 minute',
  });

  // Apply stricter per-route rate limits for sensitive endpoints (auth)
  fastify.addHook('onRoute', (routeOptions: any) => {
    try {
      const url = routeOptions.url as string | undefined;
      if (!url) return;
      const authPaths = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/refresh'];
      if (authPaths.includes(url)) {
        (routeOptions as any).config = Object.assign((routeOptions as any).config || {}, {
          rateLimit: { max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10, timeWindow: '1 minute' },
        });
      }
    } catch (err) {
      // swallow - do not crash startup for hook issues
    }
  });

  // Global exception filter to avoid stack trace leakage in production
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(4000, '0.0.0.0');
  console.log('QRD Storage API listening on http://0.0.0.0:4000/api/v1');
}

bootstrap();
