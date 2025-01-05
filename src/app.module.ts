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

const auth = [RefreshTokenModel];
const board = [BoardmetaModel, BoardContentsModel];
console.log('NODE_ENV:', process.env.NODE_ENV);
@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: PUBLIC_FOLDER_PATH,
    //   serveRoot: '/public',
    // }),

    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'development' ? '.env.local' : '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_SUPABASE_URL,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
      entities: [
        UserModel,
        TemplateMetaModel,
        SurveyQuestion,
        QustionOption,
        AnswerModel,
        RespondentModel,
        responseText,
        CommentModel,
        ReplyModel,
        AdminModel,
        ...auth,
        ...board,
      ],
      synchronize: process.env.NODE_ENV === 'development',
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
