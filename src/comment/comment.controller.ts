import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from 'src/comment/dto/createComment.dto';
import { paramsTemplateAndId, TEMPLATE_TYPE } from 'type/template';
import { withTransactions } from 'lib/withTransaction.lib';
import { DataSource, QueryRunner } from 'typeorm';
import { parseIntParam } from 'src/common/decorator/parseIntParam.decorator';
import { DeleteCommentDto } from 'src/comment/dto/deleteComment.dto';
import { TokenGuard } from 'src/auth/guard/token.guard';
import { User } from 'src/user/decorator/getUser.decorator';
import { UserModel } from 'src/user/entries/user.entity';

@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly dataSource: DataSource,
  ) {}

  @Post('/:template/:id')
  @UseGuards(TokenGuard)
  // @UseInterceptors(UserIdToUserInterceptor)
  async postComment(
    @Param() params: paramsTemplateAndId,
    @Body() body: CreateCommentDto,
  ) {
    const transaction = new withTransactions(this.dataSource);
    return transaction.execute(async (qr: QueryRunner) => {
      return await this.commentService.createComment(params, body, qr);
    });
  }

  @Get('/:template/:id')
  async getCommentList(
    @Param('template') templateType: TEMPLATE_TYPE,
    @parseIntParam('id') id: number,
  ) {
    const data = await this.commentService.getcommentList({
      id,
      template: templateType,
    });

    return data;
  }

  @Delete('/:commentId')
  @UseGuards(TokenGuard)
  deleteComment(
    @parseIntParam('commentId') id: number,
    @Body() body: DeleteCommentDto,
    @User() user?: UserModel,
  ) {
    return this.commentService.deleteCommentTarget(id, user, body.password);
  }
}
