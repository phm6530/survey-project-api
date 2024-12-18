import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { BaseModel } from 'src/common/entries/base.entity';
import { UserModel } from 'src/user/entries/user.entity';

import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class BoardmetaModel extends BaseModel {
  @Column()
  @IsString()
  title: string;

  @Column()
  @IsString()
  category: string;

  @IsOptional()
  @Column({ nullable: true })
  @IsString()
  anonymous?: string;

  @Column({ nullable: true })
  @ValidateIf((o) => o.anonymous)
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty({ message: '비 회원은 비밀번호를 입력해야 합니다.' })
  password?: string;

  @ManyToOne(() => UserModel, (user) => user.boards, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  user?: UserModel;
}
