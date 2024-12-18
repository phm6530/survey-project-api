import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokenModel } from 'src/auth/entries/refreshToken.entity';
import { UserModel } from 'src/user/entries/user.entity';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { TemplateModule } from 'src/template/template.module';
import { BoardmetaModel } from 'src/board/entries/BoardmetaModel';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      UserModel,
      RefreshTokenModel,
      TemplateMetaModel,
      BoardmetaModel,
    ]),
    TemplateModule,
  ],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
