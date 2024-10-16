import { BaseModel } from 'src/common/entries/base.entity';
import { Column, Entity } from 'typeorm';

export enum RoleEnum {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class UserModel extends BaseModel {
  @Column({ unique: true, length: 20 })
  nickname: string;

  @Column({ unique: true })
  useremail: string;

  @Column()
  password: string;

  @Column({ enum: RoleEnum, default: RoleEnum.USER })
  role: RoleEnum;
}
