import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ReplyService } from './reply.service';
import { parseIntParam } from 'src/common/decorator/parseIntParam.decorator';
import { CreateReplyDto } from 'src/reply/dto/createReply.dto';
import { DeleteReplyDto } from 'src/reply/dto/deleteReply.dto';

@Controller('reply')
export class ReplyController {
  constructor(private readonly replyService: ReplyService) {}

  @Post('/:commentId')
  postReply(
    @parseIntParam('commentId') commentId: number,
    @Body() body: CreateReplyDto,
  ) {
    return this.replyService.createReply(commentId, body);
  }

  @Delete('/:replyId')
  deleteReply(
    @parseIntParam('replyId') replyId: number,
    @Body() body: DeleteReplyDto,
  ) {
    const { password } = body;
    return this.replyService.deleteReply(replyId, password);
  }
}
