import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { JwtPayload } from '../type/jwt';
import { ENV_KEYS } from 'config/jwt.config';

@Injectable()
export class TokenAndUserData implements CanActivate {
  constructor(
    private readonly JwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  extractToken(req: any): string | null {
    const authHeader = req.headers['authorization'];
    const headerToken = authHeader?.split(' ')[1];
    const cookieToken = req.cookies['token'];

    return headerToken || cookieToken || null;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();

    try {
      const token = this.extractToken(req);

      if (!token) {
        throw new UnauthorizedException('인증 토큰이 없습니다.');
      }

      // 토큰 유효성 및 만료 여부 검증
      const decodedUserData: JwtPayload = this.JwtService.verify(token, {
        secret: this.configService.get<string>(ENV_KEYS.AUTH.SCRECT_KEY),
      });

      req.user = decodedUserData as JwtPayload;

      return true;
    } catch (error) {
      console.log(error.message);
      throw new UnauthorizedException(
        `${error.message} : 토큰이 만료되었거나 유효하지 않습니다.`,
      );
    }
  }
}
