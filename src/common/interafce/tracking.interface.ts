import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { CookieOptions, Request } from 'express';
import { map, Observable } from 'rxjs';

export interface Trackable {
  id: number;
  category?: string;
  incrementTrackCount(): Promise<void>;
}
export abstract class TrackingInterceptor implements NestInterceptor {
  protected abstract getCookieName(request: Request): string;
  protected abstract getTrackingTarget(request: Request): Trackable;
  protected abstract getCookieOptions(): CookieOptions;
  protected abstract getTrackCount(id: number): Promise<number>;

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const cookieName = this.getCookieName(request);
    const target = this.getTrackingTarget(request);

    console.log('cookieName', cookieName);
    console.log(request.cookies[cookieName]);

    // Cookie 없으면 생성
    if (!request.cookies[cookieName]) {
      await target.incrementTrackCount();
      response.cookie(cookieName, cookieName, this.getCookieOptions());
    }

    const count = await this.getTrackCount(target.id);

    console.log(count);
    return next.handle().pipe(
      map(() => ({
        count,
      })),
    );
  }
}
