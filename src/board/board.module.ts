import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardmetaModel } from './entries/BoardmetaModel';
import { UserModel } from 'src/user/entries/user.entity';
import { BoardContentsModel } from './entries/BoardContentsModel';
import { CommonModule } from 'src/common/common.module';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  controllers: [BoardController],
  providers: [BoardService],
  imports: [
    TypeOrmModule.forFeature([BoardmetaModel, BoardContentsModel, UserModel]),
    JwtModule.register({}),
    AuthModule,
    UserModule,
    CommonModule,
    CommentModule,
  ],
})
export class BoardModule {}
