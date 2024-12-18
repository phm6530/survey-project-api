import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/CreateBoardDto.dto';
import { BoardGuard } from './guard/board.guard';

import { JwtPayload } from 'src/auth/type/jwt';
import { User } from 'src/user/decorator/getUser.decorator';
import { withTransactions } from 'lib/withTransaction.lib';
import { DataSource, QueryRunner } from 'typeorm';

export const BOARD_CATEGORY = {
  FREE: 'free',
  NOTICE: 'notice',
} as const;

export type BoardCategory =
  (typeof BOARD_CATEGORY)[keyof typeof BOARD_CATEGORY];

@Controller('board')
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly dataSource: DataSource,
  ) {}

  //Get List
  @Get('/:category')
  async Boardlist(@Param('category') category: BoardCategory) {
    return await this.boardService.getList(category);
  }

  //Board Detail
  @Get('/:category/:id')
  async BoardItem(@Param() params: { category: BoardCategory; id: string }) {
    const { category, id } = params;

    if (
      !Object.values(BOARD_CATEGORY).includes(category) ||
      isNaN(parseInt(id, 10))
    ) {
      throw new BadRequestException('잘못된 요청입니다.');
    }

    return await this.boardService.getDetailPost({
      category,
      postId: parseInt(id, 10),
    });
  }

  //post
  @Post('/:category')
  @UseGuards(BoardGuard)
  async BoardPost(
    @Body() body: CreateBoardDto,
    @Param('category') category: BoardCategory,
    @User() user: JwtPayload,
  ) {
    if (!Object.values(BOARD_CATEGORY).includes(category)) {
      throw new BadRequestException('잘못된 요청입니다.');
    }

    // pool 생성
    const pool = new withTransactions(this.dataSource);
    return await pool.execute(async (qr: QueryRunner) => {
      // metaData
      return await this.boardService.createBoard(qr, {
        body,
        category,
        user,
      });
    });
  }

  //Detail Delete
  @Delete('/:category/:id')
  @UseGuards(BoardGuard)
  async deleteBoard(
    @Body() body: { anonymous?: string; password?: string },
    @Param() params: { category: BoardCategory; id: string },
    @User() jwtUser: JwtPayload,
  ) {
    const { category, id } = params;

    if (
      !Object.values(BOARD_CATEGORY).includes(category) ||
      isNaN(parseInt(id, 10))
    ) {
      throw new BadRequestException('잘못된 요청입니다.');
    }

    return await this.boardService.deletePost({
      body,
      category,
      postId: parseInt(id, 10),
      jwtUser,
    });
  }
}
