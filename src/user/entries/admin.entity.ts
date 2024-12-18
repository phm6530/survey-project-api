import { CommentModel } from 'src/comment/entries/comment.entity';
import { BaseUserModel } from 'src/user/entries/BaseUser.Entity';
import { USER_ROLE } from 'type/auth';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('admin')
export class AdminModel extends BaseUserModel {
  @Column({ enum: [USER_ROLE.ADMIN], default: USER_ROLE.ADMIN })
  role: USER_ROLE.ADMIN;

  //댓글
  @OneToMany(() => CommentModel, (comment) => comment.user)
  comments: CommentModel[];
}
