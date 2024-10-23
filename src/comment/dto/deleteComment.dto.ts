import { CommentModel } from 'src/comment/entries/comment.entity';
import { PickType } from '@nestjs/mapped-types';

export class DeleteCommentDto extends PickType(CommentModel, ['password']) {}
