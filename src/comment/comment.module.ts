import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentModel } from 'src/comment/entries/comment.entity';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([CommentModel])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
