import { Controller, Get, Param, Req, UseGuards, Res } from '@nestjs/common';
import { FilesService } from './files.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async listFiles(@Req() request: FastifyRequest & { user: { sub: string } }) {
    return this.filesService.listFiles(request.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getFile(@Req() request: FastifyRequest & { user: { sub: string } }, @Param('id') id: string) {
    return this.filesService.getFile(request.user.sub, id);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async downloadFile(
    @Req() request: FastifyRequest & { user: { sub: string } },
    @Param('id') id: string,
    @Res() reply: FastifyReply,
  ) {
    const { buffer, contentType, fileName } = await this.filesService.getDownloadProxy(request.user.sub, id);
    reply.header('content-type', contentType || 'application/octet-stream');
    reply.header('content-disposition', `attachment; filename="${fileName}"`);
    return reply.send(Buffer.from(buffer));
  }
}
