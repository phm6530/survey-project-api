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
import { CommonService } from 'src/common/common.service';
import { ConfigService } from '@nestjs/config';
import { ENV_KEYS } from 'config/jwt.config';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
    private readonly JwtService: JwtService,
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
    const { token, user } = await this.authService.loginUser(body);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 운영에선 true
      sameSite: false,
      maxAge:
        this.commonService.parseTime(
          this.configService.get<string>(ENV_KEYS.JWT.JWT_TOKEN_EXPIRES_IN),
        ) * 1000,
      path: '/',
    });

    return { user: instanceToPlain(user), token };
  }

  @Patch('/logout')
  // @UseGuards(UserInTokenGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('token', '', {
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
    console.log('AccessToken 발급');

    const { id } = req.user as UserModel;
    const refreshAccessToken = await this.authService.createAccessToken(id);
    // //엑세스 10분
    // res.cookie('accessToken', refreshAccessToken, {
    //   httpOnly: false,
    //   secure: false, //https 여부
    //   maxAge: 60 * 60 * 1000, // 60분 테스트
    //   path: '/',
    // });

    console.log(refreshAccessToken);
    return { message: 'accessToken Refresh', refreshAccessToken };
  }

  @Get('check')
  CheckAuth() {}
}
