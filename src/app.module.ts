import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { TemplateModule } from './template/template.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from 'src/user/entries/user.entity';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { SurveyQuestion } from 'src/template/entries/survey/survey-questions.entity';
import { QustionOption } from 'src/template/entries/survey/survey-option.entity';

import { AnswerModule } from './answer/answer.module';
import { AnswerModel } from 'src/answer/entries/responseSelect.entity';
import { RespondentModel } from 'src/answer/entries/respondent.entity';
import { responseText } from 'src/answer/entries/responseText.entity';
import { CommentModule } from './comment/comment.module';
import { CommentModel } from 'src/comment/entries/comment.entity';
import { ReplyModel } from 'src/reply/entries/reply.entity';
import { AdminModel } from 'src/user/entries/admin.entity';
import { ReplyModule } from './reply/reply.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RefreshTokenModel } from 'src/auth/entries/refreshToken.entity';
import { BoardModule } from './board/board.module';
import { BoardmetaModel } from './board/entries/BoardmetaModel';
import { BoardContentsModel } from './board/entries/BoardContentsModel';
import * as dotenv from 'dotenv';

//운영기 or 개발기
dotenv.config({
  path: (() => {
    switch (!!process.env.NODE_ENV) {
      case process.env.NODE_ENV === 'development':
        return '.env.local';
      case process.env.NODE_ENV === 'production':
        return '.env';
      default:
        return '.env';
    }
  })(),
});

// entities
const entities = {
  auth: [RefreshTokenModel],
  board: [BoardmetaModel, BoardContentsModel],
  user: [UserModel, AdminModel],
  template: [TemplateMetaModel, SurveyQuestion, QustionOption],
  answer: [AnswerModel, RespondentModel, responseText],
  interaction: [CommentModel, ReplyModel],
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.NODE_ENV === 'development'
        ? {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
          }
        : {
            url: process.env.DB_SUPABASE_URL,
          }),

      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: true }
          : false,
      entities: Object.values(entities).flat(),
      synchronize: process.env.NODE_ENV === 'development', // 개발에서만 true
      extra: {
        max: 10, // 최대 연결 수
        connectionTimeoutMillis: 5000, // 연결 시도 시간 초과 (5초)
        idleTimeoutMillis: 10000, // 유휴 연결 시간 (10초)
      },
    }),
    AuthModule,
    CommonModule,
    UserModule,
    TemplateModule,
    AnswerModule,
    CommentModule,
    ReplyModule,
    BoardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
