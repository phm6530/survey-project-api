import { BaseModel } from 'src/common/entries/base.entity';
import { UserModel } from 'src/user/entries/user.entity';

import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { BoardContentsModel } from './BoardContentsModel';
import { Exclude } from 'class-transformer';

@Entity()
export class BoardmetaModel extends BaseModel {
  @Column()
  title: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  anonymous?: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password?: string;

  @ManyToOne(() => UserModel, (user) => user.boards, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  user?: UserModel;

  @OneToOne(() => BoardContentsModel, (contents) => contents.boardMeta)
  contents: BoardContentsModel;

  @Column({ default: 0 })
  view: number;
}
