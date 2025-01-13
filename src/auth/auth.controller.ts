import { instanceToPlain } from 'class-transformer';
import {
  BadRequestException,
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

import { FindUserDto } from './dto/user-exist.dto';
import { EmailSerivce } from 'src/common/service/email.service';
import { PasswordResetDto } from './dto/password-reset.dto';
import { TokenGuard } from './guard/token.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
    private readonly JwtService: JwtService,
    private readonly EmailService: EmailSerivce,
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
      secure:
        this.configService.get(ENV_KEYS.STATUS) === 'development'
          ? false
          : true,
      sameSite: 'none',
      maxAge:
        this.commonService.parseTime(
          this.configService.get<string>(ENV_KEYS.JWT.JWT_TOKEN_EXPIRES_IN),
        ) * 1000,
      path: '/',
    });

    return { user: instanceToPlain(user) };
  }

  @Patch('/logout')
  // @UseGuards(UserInTokenGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('token', '', {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
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
    const { id } = req.user as UserModel;
    const refreshAccessToken = await this.authService.createAccessToken(id);

    return { message: 'accessToken Refresh', refreshAccessToken };
  }
  // Post
  @Post('/password/forgot')
  async forgetPassword(@Body() body: FindUserDto) {
    // 유저 있나 확인
    const IsExistUser = await this.authService.isExistUser({
      email: body.email,
    });

    if (!IsExistUser) {
      throw new BadRequestException('등록된 회원 정보가 없습니다.');
    }
    const pin = this.commonService.addPin(4);

    const HTML = `
        <h1>문의사항</h1>
        <br><br>
        안녕하세요 ${IsExistUser.nickname}
        핀번호 ${pin}
        <br>
      <p style="font-size:12px; opacity : .7;">
    `;

    await this.EmailService.sendEmail(IsExistUser.email, '문의 발송', HTML);

    return {
      statusCode: 200,
      menber: true,
      userEmail: IsExistUser.email,
      authPin: pin,
    };
  }

  @Post('/password/reset')
  async resetPassword(@Body() body: PasswordResetDto) {
    const { userEmail, resetPassword } = body;
    const isExistUser = await this.authService.existUser({ email: userEmail });

    //이전 비밀번호가 일치하는지?
    const comparePassword = await this.authService.verifyPassword(
      resetPassword,
      isExistUser.password,
      false,
    );

    //이전 일치하면 에러
    if (comparePassword) {
      throw new BadRequestException('현재 비밀번호와 일치합니다.');
    }
    await this.authService.updatePassword(userEmail, resetPassword);

    return {
      statusCode: 200,
    };
  }

  @Get('verify')
  @UseGuards(TokenGuard)
  CheckAuth() {
    return true;
  }
}
