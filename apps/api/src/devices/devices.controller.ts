import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service.js';
import { RegisterDeviceDto } from './dto/register-device.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { FastifyRequest } from 'fastify';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async registerDevice(@Req() request: FastifyRequest & { user: { sub: string } }, @Body() body: RegisterDeviceDto) {
    return this.devicesService.registerDevice(request.user.sub, body);
  }
}
