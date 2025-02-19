import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { withTransaction } from 'lib/withTransaction.lib';
import { DataSource, QueryRunner } from 'typeorm';
import { CreateAnswerDto } from 'src/answer/dto/CreateAnswer.dto';
import { GENDER_GROUP, TEMPLATE_TYPE } from 'type/template';
import { AgeGroup } from './entries/respondent.entity';

export type AnswerPostParams = {
  template: TEMPLATE_TYPE;
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

  @Post('/question/:id/:page')
  async getTextAnswerPage(
    @Body()
    body: { genderGroup: GENDER_GROUP | 'all'; ageGroup: AgeGroup | 'all' },
    @Param() params: { id: string; page: string },
  ) {
    const { id, page } = params;

    const [answers, isNextPage] = await this.answerService.getTextAnswer(
      +id,
      +page,
      {
        AgeGroup: body.ageGroup,
        GenderGroup: body.genderGroup,
      },
    );

    return {
      answers,
      isNextPage,
    };
  }
}
