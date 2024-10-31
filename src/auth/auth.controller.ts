import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from 'src/auth/dto/user-register.dto';
import { withTransactions } from 'lib/withTransaction.lib';
import { DataSource, QueryRunner } from 'typeorm';
import { SignInDto } from 'src/auth/dto/user-signIn.dto';
import { Response } from 'express';

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
  async login(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, user } = await this.authService.loginUser(body);

    // refersh Cookie전달 httpOnly false
    res.cookie('accessToken', accessToken, {
      httpOnly: false,
      secure: false, //https 여부
      maxAge: 5 * 60 * 1000, // 60분 테스트
      path: '/',
    });

    return { user, accessToken };
  }

  @Get('/logout')
  logout(@Res({ passthrough: true }) res: Response) {
    // 액세스 토큰 쿠키를 삭제 (만료)
    res.cookie('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // 쿠키 만료
      path: '/',
    });

    return { message: '로그아웃 되었습니다.' };
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
