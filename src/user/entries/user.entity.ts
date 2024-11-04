import { Exclude } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';
import { RefreshTokenModel } from 'src/auth/entries/refreshToken.entity';
import { CommentModel } from 'src/comment/entries/comment.entity';
import { BaseModel } from 'src/common/entries/base.entity';
import { ReplyModel } from 'src/reply/entries/reply.entity';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { RoleEnum } from 'type/auth';
import { Column, Entity, OneToMany } from 'typeorm';

//default
@Entity('users')
export class UserModel extends BaseModel {
  @Column({ type: 'enum', enum: RoleEnum, default: RoleEnum.USER })
  role: RoleEnum;

  @Column({ unique: true, length: 20 })
  @IsString()
  @Length(2, 20, { message: '닉네임은 2자에서 20자 사이여야 합니다.' })
  nickname: string;

  @Column({ unique: true })
  @IsEmail({}, { message: '올바른 이메일 형식이어야 합니다.' })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  // 유저가 생성한 템플릿들
  @OneToMany(() => TemplateMetaModel, (template) => template.creator)
  templates: TemplateMetaModel[];

  /**관계설정 */
  @OneToMany(() => RefreshTokenModel, (token) => token.user, { nullable: true })
  refreshToken?: RefreshTokenModel[];

  //대댓글
  @OneToMany(() => ReplyModel, (reply) => reply.user, {
    nullable: true,
  })
  replies?: ReplyModel[];

  //댓글
  @OneToMany(() => CommentModel, (comment) => comment.user, {
    nullable: true,
  })
  comments?: CommentModel[];
}
