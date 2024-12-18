import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BoardmetaModel } from './BoardmetaModel';

@Entity()
export class BoardContentsModel {
  @PrimaryGeneratedColumn()
  id: number;

  @JoinColumn()
  @OneToOne(() => BoardmetaModel, (meta) => meta.contents, {
    onDelete: 'CASCADE',
  })
  boardMeta: BoardmetaModel;

  @Column()
  contents: string;
}
