import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { TokenAndUserData } from 'src/auth/guard/tokenAndUserdata';

@Injectable()
export class BoardGuard implements CanActivate {
  constructor(private readonly TokenAndUserData: TokenAndUserData) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    const { password } = req.body;
    const isAnonymous = password;

    const token = this.TokenAndUserData.extractToken(req);

    try {
      /** 둘다없거나 둘다 있을때는 Bad Request  */
      if ((token && isAnonymous) || (!token && !isAnonymous)) {
        throw new BadRequestException('잘못된 요청 입니다.');
      }

      //유저의 경우
      if (token && !isAnonymous) {
        await this.TokenAndUserData.canActivate(context);
        return true;
      } else {
        return isAnonymous && true;
      }
    } catch (error) {
      throw error;
    }
  }
}
