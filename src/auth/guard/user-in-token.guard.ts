import {
  BadRequestException,
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

    try {
      const refreshToken = req.cookies['refreshToken'];

      if (!refreshToken) {
        throw new UnauthorizedException('refreshToken이 없습니다.');
      }
      const getUser = this.JwtService.decode(refreshToken);
      req.user = getUser;
      return true;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('알 수 없는 에러입니다.');
    }
  }
}
