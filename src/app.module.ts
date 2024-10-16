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
    AuthModule,
    CommonModule,
    UserModule,
    TemplateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
