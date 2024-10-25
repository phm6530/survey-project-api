import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from 'src/comment/dto/createComment.dto';
import { paramsTemplateAndId, TemplateType } from 'type/template';
import { withTransactions } from 'lib/withTransaction.lib';
import { DataSource, QueryRunner } from 'typeorm';
import { parseIntParam } from 'src/common/decorator/parseIntParam.decorator';
import { DeleteCommentDto } from 'src/comment/dto/deleteComment.dto';

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
  async getCommentList(
    @Param('template') templateType: TemplateType,
    @parseIntParam('id') id: number,
  ) {
    console.count('댓글 가져오기');
    return this.commentService.getcommentList({
      id,
      template: templateType,
    });
  }

  @Delete('/:commentId')
  deleteComment(
    @parseIntParam('commentId') id: number,
    @Body() body: DeleteCommentDto,
  ) {
    return this.commentService.deleteCommentTarget(id, body.password);
  }
}
