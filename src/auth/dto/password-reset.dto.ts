import { IsString } from 'class-validator';

export class PasswordResetDto {
  @IsString()
  resetPassword: string;

  @IsString()
  userEmail: string; // userEmail로 수정
}
