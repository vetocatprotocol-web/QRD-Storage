import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UploadService } from './upload.service.js';
import { CreateUploadSessionDto } from './upload.dto.js';
import { VerifyUploadDto } from './dto/verify-upload.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { FastifyRequest } from 'fastify';

@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('session')
  @UseGuards(JwtAuthGuard)
  async createUploadSession(
    @Req() request: FastifyRequest & { user: { sub: string } },
    @Body() body: CreateUploadSessionDto,
  ) {
    return this.uploadService.createUploadSession(request.user.sub, body);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verifyUpload(
    @Req() request: FastifyRequest & { user: { sub: string } },
    @Body() body: VerifyUploadDto,
  ) {
    return this.uploadService.verifyUploadSession(request.user.sub, body);
  }

  @Post('multipart/start')
  @UseGuards(JwtAuthGuard)
  async startMultipart(
    @Req() request: FastifyRequest & { user: { sub: string } },
    @Body() body: any,
  ) {
    return this.uploadService.startMultipartSession(request.user.sub, body);
  }

  @Post('multipart/part-url')
  @UseGuards(JwtAuthGuard)
  async getPartUrl(
    @Req() request: FastifyRequest & { user: { sub: string } },
    @Body() body: any,
  ) {
    return this.uploadService.getPartUploadUrl(request.user.sub, body.fileId);
  }

  @Post('multipart/finish')
  @UseGuards(JwtAuthGuard)
  async finishMultipart(
    @Req() request: FastifyRequest & { user: { sub: string } },
    @Body() body: any,
  ) {
    return this.uploadService.finishMultipart(request.user.sub, body);
  }
}
