import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const User = createParamDecorator((_, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();
  const user = req.user;
  console.log(user);

  if (!user) throw new InternalServerErrorException('server Error.....!!');
  return user;
});
