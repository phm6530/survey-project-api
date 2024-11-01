import { instanceToPlain } from 'class-transformer';
import {
  BadRequestException,
  Body,
  Controller,
  Patch,
  Post,
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

    await this.authService.saveRefreshToken(user, refreshToken);

    //엑세스 10분
    res.cookie('accessToken', accessToken, {
      httpOnly: false,
      secure: false, //https 여부
      maxAge: 60 * 60 * 1000, // 60분 테스트
      path: '/',
    });

    return { user: instanceToPlain(user) };
  }

  @Patch('/logout')
  async logout(
    @Body() body: { id: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    if (body.id) {
      throw new BadRequestException('잘못된 요청입니다');
    }

    // Refresh도 Flase처리
    await this.authService.invalidateRefreshToken(+body.id);

    // AccessToken은 Client에서 만료처리
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

  @Post('/refresh')
  @UseGuards(UserInTokenGuard)
  refreshAccessToken(@Res() res: Pick<UserModel, 'id' | 'email'>) {
    return this.authService.createAccessToken(+res.id);
  }
}
