import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, tap } from 'rxjs';
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
    const path = req.originalUrl;

    const { userId } = req.body;
    console.log(userId);

    const userData = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    console.log(userData);

    const now = new Date();

    console.log(`[request] : ${path} ${now.toLocaleString('kr')}`);

    // router 로직 전부 실행..
    return next.handle().pipe(tap((observable) => console.log(observable)));
  }
}
