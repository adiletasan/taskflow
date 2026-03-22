import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TemplatesService } from './templates/templates.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser());

  // CORS — разрешаем frontend
  app.enableCors({
    origin: [
      configService.get<string>('FRONTEND_URL') || 'http://localhost:5173',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const templatesService = app.get(TemplatesService);
  await templatesService.seedPublicTemplates();

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 Backend: http://localhost:${port}/api`);
}
bootstrap();