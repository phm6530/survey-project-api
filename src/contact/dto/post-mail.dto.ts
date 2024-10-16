import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class SendMailDto {
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]+$/, { message: '숫자가 아니거나 형식이 잘못되었습니다.' })
  @Length(9, 11, { message: '전화번호 길이가 잘못된거같은데요' })
  digit: string;

  @IsNotEmpty()
  @IsString()
  textarea: string;
}
