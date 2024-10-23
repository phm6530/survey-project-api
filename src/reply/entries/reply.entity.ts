import { IsString } from 'class-validator';
import { CommentModel } from 'src/comment/entries/comment.entity';
import { BaseModel } from 'src/common/entries/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class ReplyModel extends BaseModel {
  @Column({ length: 500 }) //500자
  @IsString()
  reply: string;

  @ManyToOne(() => CommentModel, (comment) => comment.replies)
  comment: CommentModel;
}
