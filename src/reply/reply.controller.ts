import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { ReplyService } from './reply.service';
import { parseIntParam } from 'src/common/decorator/parseIntParam.decorator';
import { CreateReplyDto } from 'src/reply/dto/createReply.dto';
import { DeleteReplyDto } from 'src/reply/dto/deleteReply.dto';
import { TokenGuard } from 'src/auth/guard/token.guard';
import { UserModel } from 'src/user/entries/user.entity';
import { UserInToken } from 'src/user/decorator/getUser.decorator';

@Controller('reply')
export class ReplyController {
  constructor(private readonly replyService: ReplyService) {}

  @Post('/:commentId')
  @UseGuards(TokenGuard)
  postReply(
    @parseIntParam('commentId') commentId: number,
    @Body() body: CreateReplyDto,
  ) {
    return this.replyService.createReply(commentId, body);
  }

  @Delete('/:replyId')
  @UseGuards(TokenGuard)
  deleteReply(
    @parseIntParam('replyId') replyId: number,
    @Body() body: DeleteReplyDto,
    @UserInToken() user?: UserModel,
  ) {
    const { password } = body;
    return this.replyService.deleteReply(replyId, password, user);
  }
}
