import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { CommentModel } from 'src/comment/entries/comment.entity';
import { BaseModel } from 'src/common/entries/base.entity';
import { UserModel } from 'src/user/entries/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class ReplyModel extends BaseModel {
  @Column({ length: 1000 }) //500자
  @IsString()
  @IsNotEmpty()
  content: string;

  @Column({ nullable: true })
  @ValidateIf((o) => o.anonymous)
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty({ message: '비 회원은 비밀번호를 입력해야 합니다.' })
  password?: string;

  //관계
  @ManyToOne(() => UserModel, (user) => user.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  user?: UserModel;

  @IsOptional()
  @Column({ nullable: true })
  @IsString()
  anonymous?: string;

  @ManyToOne(() => CommentModel, (comment) => comment.replies, {
    onDelete: 'CASCADE',
  })
  @IsNotEmpty()
  comment: CommentModel;
}
