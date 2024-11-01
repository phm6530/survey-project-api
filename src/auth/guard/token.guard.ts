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
    try {
      // const token = req.cookies['accessToken'];
      const rawToken = req.headers['authorization'];

      const token = rawToken.split(' ')[1];
      // console.log(tokens);

      // console.log(token);
      //
      if (!rawToken) {
        throw new BadRequestException('잘못된 요청입니다.');
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
