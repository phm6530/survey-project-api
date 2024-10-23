import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentModel } from 'src/comment/entries/comment.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([CommentModel]), AuthModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
