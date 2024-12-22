import { PickType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';
import { UserModel } from 'src/user/entries/user.entity';

export class FindUserDto extends PickType(UserModel, ['email']) {
  @IsString()
  email: string;
}
