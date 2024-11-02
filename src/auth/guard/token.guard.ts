import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private readonly JwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const body = req.body;

    //anonmous있고 userId없으면 익명처리하기
    if (
      'anonymous' in body &&
      'password' in body &&
      !body.hasOwnProperty('userId')
    ) {
      return true; // 익명은 그냥 통과시킴
    }

    try {
      const rawToken = req.headers['authorization'];
      const token = rawToken.split(' ')[1];

      if (!token) {
        throw new BadRequestException('정상적인 요청이 아닙니다.');
      }

      // 토큰 유효성 및 만료 여부 검증
      const decodedUserData = this.JwtService.verify(token, {
        secret: this.configService.get<string>('SECRET_KEY'),
      });

      req.user = decodedUserData;
      return true;
    } catch (error) {
      console.log(error.message);
      throw new UnauthorizedException('토큰이 만료되었거나 유효하지 않습니다.');
    }
  }
}
