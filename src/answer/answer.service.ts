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

import { In, QueryRunner, Repository } from 'typeorm';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(TemplateMetaModel)
    private readonly templateMetaRepository: Repository<TemplateMetaModel>,
    @InjectRepository(AnswerModel)
    private readonly answerRepositorys: Repository<AnswerModel>,
    @InjectRepository(RespondentModel)
    private readonly RespondentRepositorys: Repository<RespondentModel>,
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

    const existTemplate = await templateMetaRepository.findOne({
      where: { id: +id, templateType: template },
    });

    if (!existTemplate) {
      throw new NotFoundException('이미 삭제되었거나 잘못된 요청입니다.');
    }

    const respondentEntity = respondentRepository.create({
      age: ageGroup,
      gender,
      template: existTemplate,
    });

    //참여자 반영
    const insertResult = await respondentRepository.save(respondentEntity);

    // 아이디 추출
    const questionIds = answers.map((e) => e.questionId);

    //미리 해당 Template에 맞는 Question의 존재 확인
    const questions = await questionsRepository.find({
      where: { id: In(questionIds), templateMeta: { id: existTemplate.id } },
    });

    for (const item of answers) {
      const { questionId, type, optionId, answer } = item;

      const existQuestion = questions.find((e) => e.id === questionId);
      if (!existQuestion)
        throw new BadRequestException('없는 항목 잘못된 요청입니다.');

      if (type === 'text') {
        const entity = answerRepository.create({
          question: { id: existQuestion.id },
          answer,
          repondent: insertResult,
        });
        await answerRepository.save(entity);
      } else if (type === 'select') {
        const existOption = await optionRepository.findOne({
          where: { id: optionId },
        });

        // Add Answer Entity
        const entity = answerRepository.create({
          question: { id: existQuestion.id },
          answer,
          option: { id: existOption.id },
          repondent: insertResult,
        });
        await answerRepository.save(entity);
      }
    }
  }

  async getAnswers({ template, id }: AnswerPostParams) {
    const data = await this.templateMetaRepository.findOne({
      where: { id: +id, templateType: template },
      relations: [
        'respondents',
        'questions', //항목
        'questions.options', // 문항
        'questions.response',
        'questions.response.repondent',
        'questions.options.response', // 응답
        'questions.options.response.repondent', //참여자
      ],
    });

    console.log(data);

    //참여자 통계 - questions에서 뽑아오기
    // const totalStats = this.calculateTotalRespondentStats({
    //   id: +id,
    //   template,
    // });

    // console.log(data);

    // console.log(totalStats);
    // const respodentCnt = await this.getRespondentCount({ template, id });
    // console.log(respodentCnt);
    // const tttt = await this.getRespondentStatistics({ template, id });
    // console.log(tttt);
    // const result = {  ...data };

    return data;
  }

  // async calculateTotalRespondentStats({
  //   id,
  //   template,
  // }: {
  //   id: number;
  //   template: string;
  // }) {
  //   const genderCount = { male: 0, female: 0 };
  //   const ageGroups = {};

  //   const test = await this.RespondentRepositorys.find({
  //     where: { template: { id } },
  //   });
  //   console.log(test.length);
  // }
}
