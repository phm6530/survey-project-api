import { PickType } from '@nestjs/mapped-types';
import { BoardContentsModel } from '../entries/BoardContentsModel';
import { IsString } from 'class-validator';

export class BoardContentDto extends PickType(BoardContentsModel, [
  'contents',
]) {
  @IsString()
  contents: string;
}
