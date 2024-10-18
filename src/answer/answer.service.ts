import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnswerPostParams } from 'src/answer/answer.controller';

import { CreateAnswerDto } from 'src/answer/dto/CreateAnswer.dto';
import { AnswerModel } from 'src/answer/entries/answer.entity';
import { RespondentModel } from 'src/answer/entries/respondent.entity';
import { QustionOption } from 'src/template/entries/survey/survey-option.entity';
import { SurveyQuestion } from 'src/template/entries/survey/survey-questions.entity';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';

import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(TemplateMetaModel)
    private readonly templateMetaRepository: Repository<TemplateMetaModel>,
  ) {}

  async respondentPost(
    params: AnswerPostParams,
    body: CreateAnswerDto,
    qr: QueryRunner,
  ) {
    const { gender, ageGroup, answers } = body;
    const { id, template } = params;

    const templateMetaRepository =
      qr.manager.getRepository<TemplateMetaModel>(TemplateMetaModel);
    const questionsRepository =
      qr.manager.getRepository<SurveyQuestion>(SurveyQuestion);
    const respondentRepository =
      qr.manager.getRepository<RespondentModel>(RespondentModel);
    const answerRepository = qr.manager.getRepository<AnswerModel>(AnswerModel);
    const optionRepository =
      qr.manager.getRepository<QustionOption>(QustionOption);
    const respondentEntity = respondentRepository.create({
      age: ageGroup,
      gender,
    });

    const existTemplate = await templateMetaRepository.findOne({
      where: { id: +id, templateType: template },
    });

    if (!existTemplate) {
      throw new NotFoundException('없는 경로입니다.');
    }

    //참여자 반영
    const insertResult = await respondentRepository.save(respondentEntity);

    for (const item of answers) {
      const { questionId, type, optionId, answer } = item;

      //해당 Template에 맞는 Question의 존재 확인
      const existQuestion = await questionsRepository.findOne({
        where: { id: questionId, templateMeta: existTemplate },
      });

      if (!existQuestion) throw new BadRequestException('잘못된 요청입니다.');

      const existOption = await optionRepository.findOne({
        where: { id: optionId },
      });

      // Add Answer Entity
      const entity = answerRepository.create({
        question: existQuestion,
        answer,
        option: existOption,
        repondent: insertResult,
      });

      await answerRepository.save(entity);
    }
  }

  async getAnswers({ template, id }: AnswerPostParams) {
    const data = await this.templateMetaRepository.findOne({
      where: { id: +id, templateType: template },
      relations: [
        'questions', //항목
        'questions.options', // 문항
        'questions.options.response', // 응답
        'questions.options.response.repondent', //참여자
      ],
    });

    return data;
  }
}
