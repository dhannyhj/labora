import { Controller, Get, Render } from '@nestjs/common';
import { ResponseUtil } from './common/utils';

@Controller()
export class AppController {
  @Get()
  getWelcome() {
    return ResponseUtil.success(
      'Welcome to Labora Clinical Lab System',
      {
        name: 'Labora Clinical Lab System',
        version: '1.0.0',
        description: 'Sistem Manajemen Laboratorium Klinik Terpadu',
        status: 'running'
      }
    );
  }

  @Get('health')
  getHealth() {
    return ResponseUtil.success(
      'System is healthy',
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: '1.0.0'
      }
    );
  }

  @Get('dashboard')
  @Render('layout')
  getDashboard() {
    const currentDate = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      title: 'Dashboard',
      currentPage: 'dashboard',
      currentDate: currentDate,
      user: {
        name: 'Dr. John Doe',
        email: 'john.doe@labora.com',
        role: 'Lab Manager',
        avatar: null
      },
      breadcrumb: [
        { text: 'Dashboard', url: '/dashboard' }
      ]
    };
  }
}
