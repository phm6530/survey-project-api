import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // cors
  app.enableCors({
    origin: process.env.CORS_ALLOWED_ORIGINS,
    credentials: true, // 쿠키 허용 여부 (선택)
    methods: 'GET,POST,PUT,DELETE,PATCH', // 허용할 메서드 지정
    allowedHeaders: 'Content-Type, Authorization',
  });

  // Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      // DTO 객체로 자동 변환 (요청 데이터를 DTO 클래스의 인스턴스로 변환)
      transformOptions: { enableImplicitConversion: true },
      // 명시적으로 타입을 변환하지 않아도 자동으로 타입을 변환 (e.g., 문자열을 숫자나 boolean으로 변환)
      whitelist: true,
      // DTO에 정의된 속성만 허용하고, 나머지 속성은 자동으로 제거
      forbidNonWhitelisted: true,
      // DTO에 정의되지 않은 속성이 있을 경우, 요청을 거부하고 에러 발생
    }),
  );
  app.use(cookieParser());
  //Cookie
  app.enableCors({
    origin: 'http://localhost:3000', // 클라이언트 URL
    credentials: true, // 쿠키 전송 허용
  });
  // Port
  await app.listen(5000);
}

bootstrap();
