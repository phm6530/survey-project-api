import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { BoardService } from './board.service';

export const BOARD_CATEGORY = {
  FREE: 'free',
} as const;

type BoardCategory = (typeof BOARD_CATEGORY)[keyof typeof BOARD_CATEGORY];

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  //Board List 전달하기
  @Get('/:category')
  Boardlist(@Param('category') category: BoardCategory) {
    console.log(category);
    return category;
  }

  //Board Detail
  @Get('/:category/:id')
  BoardItem(@Param() params: { category: BoardCategory; id: string }) {
    const { category, id } = params;
    return `${category} ${id}`;
  }

  //post
  @Post('/:category')
  BoardPost(@Param('category') category: BoardCategory) {
    console.log(category);
    return category;
  }

  //Detail Delete
  @Delete('/:category/:id')
  deleteBoard(@Param('category') category: BoardCategory) {
    return `${category} 이건삭제`;
  }
}
