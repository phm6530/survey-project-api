import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserInTokenGuard implements CanActivate {
  constructor(private readonly JwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    try {
      const BearerToken = req.headers['authorization'];
      const token = BearerToken.split(' ')[1];
      if (!token) {
        throw new BadRequestException('잘못된 요청입니다.');
      }
      const getUser = this.JwtService.decode(token);
      req.user = getUser;
      return true;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('알 수 없는 에러입니다.');
    }
  }
}
