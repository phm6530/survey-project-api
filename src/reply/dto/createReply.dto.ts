import { PickType } from '@nestjs/mapped-types';
import { ReplyModel } from 'src/reply/entries/reply.entity';

export class CreateReplyDto extends PickType(ReplyModel, [
  'reply',
  'password',
  'user',
  'anonymous',
]) {}
