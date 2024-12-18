import { Injectable } from '@nestjs/common';
import { BoardmetaModel } from './entries/BoardmetaModel';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardmetaModel)
    private readonly BoardMedtaRepository: Repository<BoardmetaModel>,
  ) {}
  getList() {}

  postBoard() {}
}
