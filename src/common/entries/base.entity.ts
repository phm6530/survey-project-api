import { Exclude } from 'class-transformer';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// 추상화
export abstract class BaseModel {
  // autoincrement
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn()
  @Exclude({ toPlainOnly: true })
  updateAt: Date;

  @CreateDateColumn()
  createAt: Date;
}
