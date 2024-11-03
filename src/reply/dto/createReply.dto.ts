import { PickType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { ReplyModel } from 'src/reply/entries/reply.entity';

export class CreateReplyDto extends PickType(ReplyModel, [
  'content',
  'password',
  'user',
  'anonymous',
]) {
  @IsOptional()
  userId?: string;
}
