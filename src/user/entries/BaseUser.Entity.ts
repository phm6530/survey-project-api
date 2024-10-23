import { Exclude } from 'class-transformer';
import { IsString } from 'class-validator';
import { BaseModel } from 'src/common/entries/base.entity';
import { Column } from 'typeorm';

export abstract class BaseUserModel extends BaseModel {
  @Column({ unique: true, length: 20 })
  @IsString()
  nickname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;
}
