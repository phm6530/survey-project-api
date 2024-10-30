import { PickType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';
import { UserModel } from 'src/user/entries/user.entity';

//회원가입
export class RegisterUserDto extends PickType(UserModel, [
  'nickname',
  'email',
  'role',
]) {
  @IsString()
  password: string;
}
