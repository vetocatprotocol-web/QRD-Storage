import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  await app.listen(4000, '0.0.0.0');
  console.log('QRD Storage API listening on http://0.0.0.0:4000/api');
}

bootstrap();
