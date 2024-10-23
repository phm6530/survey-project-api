import { PickType } from '@nestjs/mapped-types';
import { UserModel } from 'src/user/entries/user.entity';

export class CreateUserDto extends PickType(UserModel, [
  'nickname',
  'password',
  'email',
  'role',
]) {}
