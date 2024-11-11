import { Observable } from 'rxjs';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';

import { TemplateService } from 'src/template/template.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExistUserTemplate implements NestInterceptor {
  constructor(
    private readonly TemplateService: TemplateService,
    private readonly JwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const { id } = req?.params;
    const { type } = req?.body;

    if (type === 'edit') {
      const isExistTemplate = await this.TemplateService.existTemplate(id);

      //토큰 뺴오기
      const rawToken = req.headers['authorization'];
      const token = rawToken?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('권한이 없습니다.');
      }

      // 토큰 유효성 및 만료 여부 검증
      const decodedUserData = this.JwtService.verify(token, {
        secret: this.configService.get<string>('SECRET_KEY'),
      });

      if (isExistTemplate.creator.email !== decodedUserData.email) {
        throw new BadRequestException('권한이 없거나 잘못된 요청입니다.');
      }
    }

    return next.handle();
  }
}
