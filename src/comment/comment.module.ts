import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentModel } from 'src/comment/entries/comment.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserModel } from 'src/user/entries/user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({}),
    CommonModule,
    TypeOrmModule.forFeature([CommentModel, UserModel]),
    AuthModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
