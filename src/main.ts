import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // cors
  app.enableCors({
    origin: process.env.CORS_ALLOWED_ORIGINS,
    credentials: true, // 쿠키 허용 여부 (선택)
    methods: 'GET,POST,PUT,DELETE', // 허용할 메서드 지정
    allowedHeaders: 'Content-Type, Authorization',
  });

  // Pipe
  app.useGlobalPipes(new ValidationPipe());

  // Port
  await app.listen(5000);
}

bootstrap();
