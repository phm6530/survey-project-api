import { USER_ROLE } from 'type/auth';

interface JwtPayload {
  id: number;
  role: USER_ROLE;
  email: string;
  nickname: string;
  refreshExp: number;
  iat: number; // issued at: 토큰 발급 시간
  exp: number; // expiration: 토큰 만료 시간
}

export { JwtPayload };
