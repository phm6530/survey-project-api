import { PickType } from '@nestjs/mapped-types';
import { ReplyModel } from 'src/reply/entries/reply.entity';

export class DeleteReplyDto extends PickType(ReplyModel, ['password']) {}
