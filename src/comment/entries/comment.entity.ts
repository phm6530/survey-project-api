import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { ReplyModel } from 'src/comment/entries/reply.entity';
import { BaseModel } from 'src/common/entries/base.entity';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { UserModel } from 'src/user/entries/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class CommentModel extends BaseModel {
  @ManyToOne(() => TemplateMetaModel, (template) => template.comments)
  template: TemplateMetaModel;

  // 댓글 작성자
  @ManyToOne(() => UserModel, (user) => user.comments, { nullable: true })
  user?: UserModel;

  // Comment
  @Column()
  @IsString()
  comment: string;

  // 익명일 시에는 password 받아야함
  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  @ValidateIf((o) => !o.user)
  @IsNotEmpty({ message: '비회원은 비밀번호를 입력해야 합니다.' })
  password: string;

  //댓글와 연결할 대댓글
  //초기작성시에는 없으니까 null 허용
  @OneToMany(() => ReplyModel, (reply) => reply.comment, { nullable: true })
  replies?: ReplyModel[];
}
