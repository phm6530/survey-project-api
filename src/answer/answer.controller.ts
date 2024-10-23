import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { withTransaction } from 'lib/withTransaction.lib';
import { DataSource, QueryRunner } from 'typeorm';
import { CreateAnswerDto } from 'src/answer/dto/CreateAnswer.dto';
import { TemplateType } from 'type/template';

export type AnswerPostParams = {
  template: TemplateType;
  id: string;
};

// {
//   "gender": "male",
//   "ageGroup": "50",
//   "answers": [
//     { "questionId": 219, "answer": "아니오" },
//     { "questionId": 220, "answer": "tst" }
//   ]
// }

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
    const result = await withTransaction(
      this.dataSource,
      async (qr: QueryRunner) => {
        return await this.answerService.respondentPost(params, body, qr);
      },
    );
    return result;
  }

  @Get('/:template/:id')
  async getResult(@Param() params: AnswerPostParams) {
    const result = await this.answerService.getAnswers(params);
    return result;
  }
}
