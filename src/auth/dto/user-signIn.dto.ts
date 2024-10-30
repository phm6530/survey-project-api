import { PickType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';
import { UserModel } from 'src/user/entries/user.entity';

//로그인
export class SignInDto extends PickType(UserModel, ['email']) {
  @IsString()
  password: string;
}
