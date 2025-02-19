import { Injectable } from '@nestjs/common';
import {
  Trackable,
  TrackingInterceptor,
} from 'src/common/interafce/tracking.interface';
import { Request } from 'express';
import { BoardService } from '../board.service';
import { CookieOptions } from 'express';

@Injectable()
export class ViewCountInterceptor extends TrackingInterceptor {
  constructor(private readonly boardService: BoardService) {
    super();
  }

  protected getCookieName(request: Request): string {
    const { category, id } = request.params as { category: string; id: string };
    return `board_${category}_${id}`;
  }

  protected getTrackingTarget(request: Request): Trackable {
    const { id, category } = request.params as { id: string; category: string };
    console.count(id);

    return {
      id: parseInt(id, 10),
      category,
      incrementTrackCount: () =>
        this.boardService.incrementViewCount(parseInt(id, 10)),
    };
  }

  protected async getTrackCount(id: number): Promise<number> {
    return await this.boardService.getViewCount(id);
  }

  protected getCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000,
      path: '/',
    };
  }
}
