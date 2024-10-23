import { PickType } from '@nestjs/mapped-types';
import { CommentModel } from 'src/comment/entries/comment.entity';

export class CreateCommentDto extends PickType(CommentModel, [
  'comment',
  'password',
  'user',
]) {}
