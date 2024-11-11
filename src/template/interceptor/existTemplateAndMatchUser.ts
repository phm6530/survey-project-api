import { TemplateService } from './../template.service';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable } from 'rxjs';

/**
 * 생성한 사용자가 아닐 경우 에러 반환하기
 */

@Injectable()
export class ExistTemplateAndMatchUser implements NestInterceptor {
  constructor(private readonly TemplateService: TemplateService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const { id } = req.params;

    // Id 미존재..
    if (!id) {
      throw new BadRequestException('잘못된 요청입니다.');
    }

    // 템플릿을 생성한 사용자와 요청사용자가 다를때는 에러
    const existsTemplate = await this.TemplateService.existTemplate(id);
    if (!existsTemplate || existsTemplate?.creator?.email !== user?.email) {
      console.log('걸?');
      throw new BadRequestException('잘못된 요청입니다.');
    }

    return next.handle();
  }
}
