import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardmetaModel } from './entries/BoardmetaModel';
import { UserModel } from 'src/user/entries/user.entity';
import { BoardModel } from './entries/BoardModel';

@Module({
  controllers: [BoardController],
  providers: [BoardService],
  imports: [
    TypeOrmModule.forFeature([BoardmetaModel, BoardModel, UserModel]),
    JwtModule.register({}),
    AuthModule,
    UserModule,
  ],
})
export class BoardModule {}