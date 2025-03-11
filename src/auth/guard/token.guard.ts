import { JwtService } from '@nestjs/jwt';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV_KEYS } from 'config/jwt.config';
import { JwtPayload } from '../type/jwt';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private readonly JwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const body = req.body;
    const path = req.path;
    const method = req.method;

    //anonmous있고 userId없으면 익명처리하기 Comment에서만 익명 통과
    //
    const isAnonymousCommentCreation = (
      path: string,
      method: string,
      body: any,
    ): boolean => {
      return (
        (path.startsWith('/comment') || path.startsWith('/reply')) &&
        method === 'POST' &&
        'anonymous' in body &&
        'password' in body &&
        !body.hasOwnProperty('userId')
      );
    };

    const isAnonymousCommentDeletion = (
      path: string,
      method: string,
      body: any,
    ): boolean => {
      return (
        (path.startsWith('/comment') || path.startsWith('/reply')) &&
        method === 'DELETE' &&
        'password' in body
      );
    };

    // 사용 예시
    if (
      isAnonymousCommentCreation(path, method, body) ||
      isAnonymousCommentDeletion(path, method, body)
    ) {
      return true; // 익명 댓글 작성/삭제 허용
    }

    try {
      const authHeader = req.headers['authorization'];
      const headerToken = authHeader?.split(' ')[1];

      // 쿠키에서 토큰 추출
      const cookieToken = req.cookies['token'];

      // 두 토큰 중 하나 사용 (헤더 우선)
      const token = headerToken || cookieToken;

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
      throw new UnauthorizedException(
        `${error.message} : 토큰이 만료되었거나 유효하지 않습니다.`,
      );
    }
  }
}
