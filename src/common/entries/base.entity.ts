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

  @UpdateDateColumn() // 자동업데이트
  @Exclude({ toPlainOnly: true })
  updateAt: Date;

  @CreateDateColumn() // 생성때만 업데이트
  createdAt: Date;
}
