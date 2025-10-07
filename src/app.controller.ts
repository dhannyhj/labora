import { Controller, Get } from '@nestjs/common';
import { ResponseUtil } from './common/utils';

@Controller()
export class AppController {
  @Get()
  getWelcome() {
    return ResponseUtil.success({
      name: 'Labora Clinical Lab System',
      version: '1.0.0',
      description: 'Sistem Manajemen Laboratorium Klinik Terpadu',
      status: 'running'
    }, 'Welcome to Labora Clinical Lab System');
  }

  @Get('health')
  getHealth() {
    return ResponseUtil.success({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.0.0'
    }, 'System is healthy');
  }
}
