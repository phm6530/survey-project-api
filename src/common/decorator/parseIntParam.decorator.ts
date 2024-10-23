import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export const parseIntParam = createParamDecorator(
  (Key: string, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    const param = request.params[Key];

    if (!/^\d+$/.test(param)) {
      throw new BadRequestException('올바른 요청이 아닙니다');
    }

    //10진수로
    return parseInt(param, 10) as number;
  },
);
