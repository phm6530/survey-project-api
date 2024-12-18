import { PickType } from '@nestjs/mapped-types';
import { BoardmetaModel } from '../entries/BoardmetaModel';
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreateBoardDto extends PickType(BoardmetaModel, [
  'title',
  'anonymous',
  'password',
  'user',
]) {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  anonymous?: string;

  @ValidateIf((o) => o.anonymous)
  @IsNotEmpty({ message: '비밀번호가 없습니다.' })
  password?: string;

  @IsString({ message: '콘텐츠 입력' })
  contents: string;

  // @ValidateIf((o) => !o.anonymous)
  // @IsNotEmpty({ message: '잘못된 요청입니다.' })
  // @ValidateNested() // 중첩검사
  // @Type(() => UserModel)
  // user?: UserModel;
}
