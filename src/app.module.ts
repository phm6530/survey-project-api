import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContactModule } from './contact/contact.module';
import { ConfigModule } from '@nestjs/config';
// import { ServeStaticModule } from '@nestjs/serve-static';
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

const auth = [RefreshTokenModel];

@Module({
  imports: [
    ContactModule,
    // ServeStaticModule.forRoot({
    //   rootPath: PUBLIC_FOLDER_PATH,
    //   serveRoot: '/public',
    // }),

    ConfigModule.forRoot({
      envFilePath: '.env.local',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
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
      ],
      synchronize: true,
    }),
    AuthModule,
    CommonModule,
    UserModule,
    TemplateModule,
    AnswerModule,
    CommentModule,
    ReplyModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
