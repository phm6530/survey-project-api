import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { withTransaction } from 'lib/withTransaction.lib';
import { DataSource, QueryRunner } from 'typeorm';
import { CreateAnswerDto } from 'src/answer/dto/CreateAnswer.dto';
import { TEMPLATE_TYPE } from 'type/template';

export type AnswerPostParams = {
  template: TEMPLATE_TYPE;
  id: string;
};

@Controller('answer')
export class AnswerController {
  constructor(
    private readonly answerService: AnswerService,
    private readonly dataSource: DataSource,
  ) {}

  // 항목에 대한 답변
  @Post('/:template/:id')
  async answerPost(
    @Param() params: AnswerPostParams,
    @Body() body: CreateAnswerDto,
  ) {
    await withTransaction(this.dataSource, async (qr: QueryRunner) => {
      await this.answerService.respondentPost(params, body, qr);
    });
    return {
      statusCode: 201,
      message: 'success',
    };
  }

  @Get('/:template/:id')
  async getResult(@Param() params: AnswerPostParams) {
    const result = await this.answerService.getAnswers(params);
    return result;
  }

  // 주관식 Infinity Scroll로 페이징
  @Get('/question/:id/:page')
  async getTextAnswerPage(@Param() params: { id: string; page: string }) {
    const { id, page } = params;

    const [answers, isNextPage] = await this.answerService.getTextAnswer(
      +id,
      +page,
    );

    return {
      answers,
      isNextPage,
    };
  }
}
