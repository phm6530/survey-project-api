import { CommentModel } from 'src/comment/entries/comment.entity';
import { BaseUserModel } from 'src/user/entries/BaseUser.Entity';
import { RoleEnum } from 'type/auth';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('admin')
export class AdminModel extends BaseUserModel {
  @Column({ enum: [RoleEnum.ADMIN], default: RoleEnum.ADMIN })
  role: RoleEnum.ADMIN;

  //댓글
  @OneToMany(() => CommentModel, (comment) => comment.user)
  comments: CommentModel[];
}
