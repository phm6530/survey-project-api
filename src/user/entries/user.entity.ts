import { Exclude } from 'class-transformer';
import { IsString } from 'class-validator';
import { CommentModel } from 'src/comment/entries/comment.entity';
import { BaseModel } from 'src/common/entries/base.entity';
import { RoleEnum } from 'type/auth';
import { Column, Entity, OneToMany } from 'typeorm';

//default
@Entity('users')
export class UserModel extends BaseModel {
  @Column({ type: 'enum', enum: RoleEnum, default: RoleEnum.USER })
  role: RoleEnum;

  @Column({ unique: true, length: 20 })
  @IsString()
  nickname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  //관계
  @OneToMany(() => CommentModel, (comment) => comment.user, { nullable: true })
  comments?: CommentModel[];
}
