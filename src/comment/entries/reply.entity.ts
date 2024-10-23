import { CommentModel } from 'src/comment/entries/comment.entity';
import { BaseModel } from 'src/common/entries/base.entity';
import { Entity, ManyToOne } from 'typeorm';

@Entity()
export class ReplyModel extends BaseModel {
  @ManyToOne(() => CommentModel, (comment) => comment.replies)
  comment: CommentModel;
}
