import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenGuard } from 'src/auth/guard/token.guard';
import { TemplateService } from '../template.service';

@Injectable()
export class TemplateEditGuard implements CanActivate {
  constructor(
    private readonly tokenGuard: TokenGuard, // 관례상 camelCase로
    private readonly templateService: TemplateService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { type } = req.query;
    const { id } = req.params;

    if (type === 'edit') {
      try {
        const isTokenValid = await this.tokenGuard.canActivate(context);

        if (!isTokenValid) {
          throw new UnauthorizedException('유효하지 않은 토큰입니다');
        }

        const template = await this.templateService.existTemplate(id);

        if (template.creator.email !== req.user.email) {
          throw new UnauthorizedException('템플릿에 대한 접근 권한이 없습니다');
        }

        return true;
      } catch (error) {
        // 에러 처리 추가
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        throw new UnauthorizedException('인증 처리 중 오류가 발생했습니다');
      }
    }

    return true;
  }
}
