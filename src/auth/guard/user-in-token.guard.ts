import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserInTokenGuard implements CanActivate {
  constructor(private readonly JwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    // console.log('Request URL:', req.url); // 어떤 엔드포인트인지
    // console.log('Request Method:', req.method);
    // console.log('Headers:', req.headers);
    // console.log('All Cookies:', req.cookies);

    try {
      const refreshToken = req.cookies['refreshToken'];
      console.log('refreshToken::', refreshToken);

      if (!refreshToken) {
        throw new UnauthorizedException('refreshToken이 없습니다.');
      }

      try {
        const getUser = this.JwtService.decode(refreshToken);
        console.log('Decoded Token:', getUser);
        req.user = getUser;
        return true;
      } catch (jwtError) {
        console.log('JWT Error:', jwtError);
        throw new UnauthorizedException('Invalid token');
      }
    } catch (error) {
      console.log('Error:', error);
      throw error; // 원래 에러를 그대로 던지기
    }
  }
}
