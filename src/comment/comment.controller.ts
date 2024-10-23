import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from 'src/comment/dto/createComment.dto';
import { paramsTemplateAndId } from 'type/template';
import { withTransactions } from 'lib/withTransaction.lib';
import { DataSource, QueryRunner } from 'typeorm';
import { parseIntParam } from 'src/common/decorator/parseIntParam.decorator';

@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly dataSource: DataSource,
  ) {}

  @Post('/:template/:id')
  postComment(
    @Param() params: paramsTemplateAndId,
    @Body() body: CreateCommentDto,
  ) {
    const transaction = new withTransactions(this.dataSource);
    return transaction.execute(async (qr: QueryRunner) => {
      return await this.commentService.createComment(params, body, qr);
    });
  }

  @Get('/:template/:id')
  async getCommentList(@Param() params: paramsTemplateAndId) {
    return this.commentService.getcommentList({
      id: params.id,
      template: params.template,
    });
  }

  @Delete('/:commentId')
  deleteComment(@parseIntParam('commentId') id: string) {
    return this.commentService.deleteCommentTarget(id);
  }
}
