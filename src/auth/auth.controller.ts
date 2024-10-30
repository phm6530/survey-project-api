import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from 'src/auth/dto/user-register.dto';
import { withTransactions } from 'lib/withTransaction.lib';
import { DataSource, QueryRunner } from 'typeorm';
import { SignInDto } from 'src/auth/dto/user-signIn.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
  ) {}
  /**
   * + 비밀번호 변경
   * + JWT (Refresh + accessToken)
   */

  //유저 로그인
  @Post('/login')
  loginUser(@Body() body: SignInDto) {
    return this.authService.loginUser(body);
  }

  //유저 회원가입
  @Post('/register')
  registerUser(@Body() body: RegisterUserDto) {
    const transaction = new withTransactions(this.dataSource);

    //유저 생성
    return transaction.execute(async (qr: QueryRunner) => {
      return await this.authService.createUser(body, qr);
    });
  }
}
