import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ReplyModel } from 'src/reply/entries/reply.entity';
import { BaseModel } from 'src/common/entries/base.entity';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { UserModel } from 'src/user/entries/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class CommentModel extends BaseModel {
  @ManyToOne(() => TemplateMetaModel, (template) => template.comments, {
    onDelete: 'CASCADE',
  })
  template: TemplateMetaModel;

  // 댓글 작성자
  @ManyToOne(() => UserModel, (user) => user.comments, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  user?: UserModel;

  // @ValidateIf((o) => !o.user)
  @IsOptional()
  @Column({ nullable: true })
  @IsString()
  anonymous?: string;

  // Comment
  @IsNotEmpty({ message: '댓글은 비워둘 수 없습니다.' })
  @Column({ length: 1000 })
  @IsString()
  content: string;

  // 익명일 시에는 password 받아야함
  @Column({ nullable: true })
  @ValidateIf((o) => o.anonymous)
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty({ message: '비회원은 비밀번호를 입력해야 합니다.' })
  password: string;

  //댓글와 연결할 대댓글
  //초기작성시에는 없으니까 null 허용
  @OneToMany(() => ReplyModel, (reply) => reply.comment, {
    nullable: true,
  })
  replies?: ReplyModel[];
}
