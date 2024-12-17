import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModel } from 'src/user/entries/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokenModel } from 'src/auth/entries/refreshToken.entity';

import { CommonModule } from 'src/common/common.module';
import { TokenGuard } from './guard/token.guard';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([UserModel, RefreshTokenModel]),
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenGuard],
  exports: [AuthService, TokenGuard],
})
export class AuthModule {}
