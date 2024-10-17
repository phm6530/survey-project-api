import { Module } from '@nestjs/common';
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
      entities: [UserModel, TemplateMetaModel, SurveyQuestion, QustionOption],
      synchronize: true,
    }),
    AuthModule,
    CommonModule,
    UserModule,
    TemplateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
