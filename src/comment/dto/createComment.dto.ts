import { PickType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { CommentModel } from 'src/comment/entries/comment.entity';

export class CreateCommentDto extends PickType(CommentModel, [
  'content',
  'password',
  'user',
  'anonymous',
]) {
  @IsOptional()
  userId?: string;
}
