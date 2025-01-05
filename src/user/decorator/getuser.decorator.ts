import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/auth/type/jwt';

export const UserInToken = createParamDecorator(
  (_, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const user = req.user as JwtPayload;

    if (!user) return null;
    return user;
  },
);
