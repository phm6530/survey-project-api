import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { UserModel } from 'src/user/entries/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserIdToUserInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    // const path = req.originalUrl;

    const { userId: id } = req.body;

    if (id) {
      const userData = await this.userRepository.findOne({
        where: { id },
      });
      req.body.user = userData;
    }

    // const now = new Date();

    // router 로직 전부 실행..
    return next.handle();
  }
}
