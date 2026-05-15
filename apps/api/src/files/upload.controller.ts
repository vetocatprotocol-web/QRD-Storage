import { Body, Controller, Post } from '@nestjs/common';
import { UploadService } from './upload.service.js';
import type { CreateUploadSessionDto } from './upload.dto.js';

@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('session')
  async createUploadSession(@Body() body: CreateUploadSessionDto) {
    return this.uploadService.createUploadSession(body);
  }
}
