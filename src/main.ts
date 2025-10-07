import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static assets
  app.useStaticAssets(join(__dirname, '..', 'frontend', 'assets'), {
    prefix: '/assets/',
  });
  
  // Set up view engine for templates
  app.setBaseViewsDir(join(__dirname, '..', 'frontend', 'templates'));
  app.setViewEngine('hbs');
  
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}

bootstrap();
