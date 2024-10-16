import { PickType } from '@nestjs/mapped-types';
import { Exclude } from 'class-transformer';
import { IsEnum, IsString } from 'class-validator';
import { RoleEnum, UserModel } from 'src/user/entries/user.entity';

export class CreateUserDto extends PickType(UserModel, [
  'nickname',
  'password',
  'useremail',
  'role',
]) {
  @IsString()
  nickname: string;

  @IsString()
  useremail: string;

  @Exclude({ toPlainOnly: true })
  password: string;

  @IsEnum(RoleEnum)
  role: RoleEnum;
}
