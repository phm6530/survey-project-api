import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnswerPostParams } from 'src/answer/answer.controller';

import { CreateAnswerDto } from 'src/answer/dto/CreateAnswer.dto';
import { AnswerModel } from 'src/answer/entries/responseSelect.entity';
import {
  AgeGroup,
  RespondentModel,
} from 'src/answer/entries/respondent.entity';
import { QustionOption } from 'src/template/entries/survey/survey-option.entity';
import {
  QuestionTypes,
  SurveyQuestion,
} from 'src/template/entries/survey/survey-questions.entity';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';

import { In, QueryRunner, Repository } from 'typeorm';
import { responseText } from 'src/answer/entries/responseText.entity';
import { respondentsGroup, testFilter } from 'util/respondentsFilter.util';
import { GENDER_GROUP } from 'type/template';
import maxGroupData from 'util/maxGroup';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(TemplateMetaModel)
    private readonly templateMetaRepository: Repository<TemplateMetaModel>,
    private readonly commonService: CommonService,
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

    if (
      existTemplate.startDate &&
      this.commonService.DateCompareToday().isBefore(existTemplate.startDate)
    ) {
      throw new BadRequestException('제출 기간이 아닙니다.');
    }

    console.log('제출됨?');

    if (
      existTemplate.endDate &&
      this.commonService.DateCompareToday().isAfter(existTemplate.endDate)
    ) {
      throw new BadRequestException('제출 기간이 종료 되었습니다.');
    }

    // existTemplate.startDate;
    // existTemplate.endDate;

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
      const { questionId, type, optionId: optionsAnswer, answer } = item;

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
        // 객관식

        for (const item of optionsAnswer) {
          const existOption = await optionRepository.findOne({
            where: { id: Object.values(item)[0] },
          });
          // Add Answer Entity
          const entity = answerRepository.create({
            question: { id: existOption.id },
            answer,
            repondent: insertResult,
          });
          await answerRepository.save(entity);
        }
      } else {
        throw new BadRequestException('없는 항목 잘못된 요청입니다.') as never;
      }
    }
  }

  async getAnswers({ template, id }: AnswerPostParams) {
    const data = await this.templateMetaRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.respondents', 'respondents')
      .leftJoinAndSelect('template.questions', 'questions')
      .leftJoinAndSelect('template.creator', 'creator')

      .leftJoinAndSelect('questions.textAnswers', 'textAnswers')
      .leftJoinAndSelect('textAnswers.respondent', 'respondent')

      .leftJoinAndSelect('questions.options', 'options')
      .leftJoinAndSelect('options.response', 'response')
      .leftJoinAndSelect('response.repondent', 'repondent')

      .where('template.id = :id', { id })
      .andWhere('template.templateType = :type', { type: template })
      .orderBy('questions.id', 'ASC')
      .getOne();

    if (!data) {
      throw new NotFoundException('이미 삭제되었거나 잘못된 요청입니다.');
    }

    const { questions, respondents, ...rest } = data;

    //O(n)
    const respodentsGroupData = respondentsGroup(respondents);
    const maxGroup = maxGroupData(respodentsGroupData);

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
            const responseGroupData = testFilter(groupData);

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
      creator: {
        nickname: data.creator.nickname,
        role: data.creator.role,
        email: data.creator.email,
      },
      respondents: {
        allCnt: respondents.length,
        detail: { ...respodentsGroupData, maxGroup },
      },
      questions: newQuestions,
    };
  }

  // 10개씩
  async getTextAnswer(
    id: number,
    page: number = 1,
    filters: {
      AgeGroup?: AgeGroup | 'all';
      GenderGroup?: GENDER_GROUP | 'all';
    } = {},
  ) {
    const limit = 10;

    const queryBuilder = this.TextAnwersRepositorys.createQueryBuilder(
      'textAnswers',
    )
      .leftJoinAndSelect('textAnswers.respondent', 'respondent')
      .where('textAnswers.questionId = :questionId', {
        questionId: id,
      });

    // if (
    //   filters.GenderGroup &&
    //   (filters.GenderGroup === GENDER_GROUP.FEMALE ||
    //     filters.GenderGroup === GENDER_GROUP.MALE)
    // ) {
    //   queryBuilder.andWhere('respondent.gender = :gender', {
    //     gender: filters.GenderGroup,
    //   });
    // }

    // if (filters.AgeGroup && filters.AgeGroup !== 'all') {
    //   queryBuilder.andWhere('respondent.age = :age', {
    //     age: filters.AgeGroup,
    //   });
    // }

    const [Answers, totalCnt] = await queryBuilder
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
