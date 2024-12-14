import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnswerPostParams } from 'src/answer/answer.controller';

import { CreateAnswerDto } from 'src/answer/dto/CreateAnswer.dto';
import { AnswerModel } from 'src/answer/entries/responseSelect.entity';
import { RespondentModel } from 'src/answer/entries/respondent.entity';
import { QustionOption } from 'src/template/entries/survey/survey-option.entity';
import {
  QuestionTypes,
  SurveyQuestion,
} from 'src/template/entries/survey/survey-questions.entity';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';

import { In, QueryRunner, Repository } from 'typeorm';
import { responseText } from 'src/answer/entries/responseText.entity';
import { respondentsGroup } from 'util/respondentsFilter.util';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(TemplateMetaModel)
    private readonly templateMetaRepository: Repository<TemplateMetaModel>,
    // @InjectRepository(AnswerModel)
    // private readonly answerRepositorys: Repository<AnswerModel>,
    // @InjectRepository(RespondentModel)
    // private readonly RespondentRepositorys: Repository<RespondentModel>,
    @InjectRepository(responseText)
    private readonly TextAnwersRepositorys: Repository<responseText>,
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

    //주관식
    const answerRepository = qr.manager.getRepository<AnswerModel>(AnswerModel);

    const responseTextRepository =
      qr.manager.getRepository<responseText>(responseText);

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
        //주관식 반영
        const entity = responseTextRepository.create({
          answer,
          question: { id: existQuestion.id },
          respondent: { id: insertResult.id },
        });

        await responseTextRepository.save(entity);
      } else if (type === 'select') {
        //객관식반영
        const existOption = await optionRepository.findOne({
          where: { id: optionId },
        });

        // Add Answer Entity
        const entity = answerRepository.create({
          question: { id: existOption.id },
          answer,
          repondent: insertResult,
        });

        await answerRepository.save(entity);
      } else {
        throw new BadRequestException('없는 항목 잘못된 요청입니다.') as never;
      }
    }
  }

  async getAnswers({ template, id }: AnswerPostParams) {
    console.count('Answers::');
    // const data = await this.templateMetaRepository.findOne({
    //   where: { id: +id, templateType: template },
    //   relations: [
    //     'respondents', //참여자
    //     'questions',
    //     //주관식
    //     'questions.textAnswers',
    //     'questions.textAnswers.respondent',

    //     //객관식
    //     'questions.options',
    //     'questions.options.response',
    //     'questions.options.response.repondent',
    //   ],
    // });

    const data = await this.templateMetaRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.respondents', 'respondents')
      .leftJoinAndSelect('template.questions', 'questions')

      .leftJoinAndSelect('questions.textAnswers', 'textAnswers')
      .leftJoinAndSelect('textAnswers.respondent', 'respondent')

      .leftJoinAndSelect('questions.options', 'options')
      .leftJoinAndSelect('options.response', 'response')
      .leftJoinAndSelect('response.repondent', 'repondent')

      .where('template.id = :id', { id })
      .andWhere('template.templateType = :type', { type: template })
      .orderBy('questions.id', 'ASC')
      .getOne();

    if (data && data.questions) {
      const questions = data.questions;

      for (const qs of questions) {
        if (qs.type === QuestionTypes.TEXT) {
          const [textAnswers, isNextPage] = await this.getTextAnswer(qs.id);
          console.log('isNextPage', isNextPage);

          qs.textAnswers = textAnswers as responseText[];
        }
      }
    }

    if (!data) {
      throw new NotFoundException('이미 삭제되었거나 잘못된 요청입니다.');
    }

    const { questions, respondents, ...rest } = data;

    //O(n)
    const respodentsGroupData = respondentsGroup(respondents);

    //template
    const newQuestions = await Promise.all(
      questions.map(async (qs) => {
        const { options, ...rest } = qs;

        if (qs.type === QuestionTypes.SELECT) {
          const newOptions = options.map((op) => {
            const { response, ...rest } = op;
            const groupData = response.map((e) => {
              return {
                gender: e.repondent.gender,
                age: e.repondent.age,
              };
            });
            const responseGroupData = respondentsGroup(groupData);
            return { ...rest, response: responseGroupData };
          });

          return { ...rest, options: newOptions };
        } else if (qs.type === QuestionTypes.TEXT) {
          const [textAnswers, isNextPage] = await this.getTextAnswer(qs.id);
          return { ...rest, textAnswers, isNextPage };
        } else {
          throw new BadRequestException('잘못된 요청입니다.');
        }
      }),
    );

    return {
      ...rest,
      respondents: { allCnt: respondents.length, detail: respodentsGroupData },
      questions: newQuestions,
    };
  }

  // 10개씩
  async getTextAnswer(id: number, page: number = 1) {
    const limit = 10;

    const [Answers, totalCnt] =
      await this.TextAnwersRepositorys.createQueryBuilder('textAnswers')
        .leftJoinAndSelect('textAnswers.respondent', 'respondent')
        .where('textAnswers.questionId = :questionId', {
          questionId: id,
        })
        .orderBy('textAnswers.id', 'DESC')
        .addOrderBy('respondent.id', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();
    const nextPage =
      totalCnt > Answers.length + (page - 1) * limit ? page + 1 : null;
    return [Answers, nextPage];
  }
}
