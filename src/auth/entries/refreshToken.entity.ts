import { BaseModel } from 'src/common/entries/base.entity';
import { UserModel } from 'src/user/entries/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class RefreshTokenModel extends BaseModel {
  @Column()
  token: string;

  @Column({ default: true })
  isVaild: boolean;

  @ManyToOne(() => UserModel, (user) => user.refreshToken)
  user: UserModel;
}
