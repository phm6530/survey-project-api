import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((_, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();
  const user = req.user;
  // console.log(user);

  if (!user) return null;
  return user;
});
