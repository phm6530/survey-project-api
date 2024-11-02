import { instanceToPlain } from 'class-transformer';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from 'src/auth/dto/user-register.dto';
import { withTransactions } from 'lib/withTransaction.lib';
import { DataSource, QueryRunner } from 'typeorm';
import { SignInDto } from 'src/auth/dto/user-signIn.dto';
import { Response } from 'express';
import { UserInTokenGuard } from 'src/auth/guard/user-in-token.guard';
import { UserModel } from 'src/user/entries/user.entity';

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
    const { accessToken, user, refreshToken } =
      await this.authService.loginUser(body);

    // await this.authService.saveRefreshToken(user, refreshToken);

    // refresh Token 일단 60분
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, //https 여부
      maxAge: 60 * 60 * 1000, // 60분 테스트
      path: '/',
    });

    return { user: instanceToPlain(user), accessToken };
  }

  @Patch('/logout')
  // @UseGuards(UserInTokenGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    console.log('요청?');

    res.cookie('refreshToken', '', {
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

  @Get('/accesstoken')
  @UseGuards(UserInTokenGuard)
  async refreshAccessToken(@Request() req: any) {
    console.log('나실행함????ㄴ');

    const { id } = req.user as UserModel;
    const refreshAccessToken = await this.authService.createAccessToken(id);
    // //엑세스 10분
    // res.cookie('accessToken', refreshAccessToken, {
    //   httpOnly: false,
    //   secure: false, //https 여부
    //   maxAge: 60 * 60 * 1000, // 60분 테스트
    //   path: '/',
    // });

    return { message: 'accessToken Refresh', refreshAccessToken };
  }
}
