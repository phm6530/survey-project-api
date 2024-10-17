import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // cors
  app.enableCors({
    origin: process.env.CORS_ALLOWED_ORIGINS, // 허용할 도메인
    credentials: true, // 쿠키 허용 여부 (선택)
    methods: 'GET,POST,PUT,DELETE', // 허용할 메서드 지정
    allowedHeaders: 'Content-Type, Authorization', // 허용할 헤더
  });

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(5000);
}
bootstrap();
