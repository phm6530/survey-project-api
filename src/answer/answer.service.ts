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
    const data = await this.templateMetaRepository.findOne({
      where: { id: +id, templateType: template },
      relations: [
        'respondents', //참여자
        'questions',
        //주관식
        'questions.textAnswers',
        'questions.textAnswers.respondent',

        //객관식
        'questions.options',
        'questions.options.response',
        'questions.options.response.repondent',
      ],
    });

    const countByGenderAndAge = (
      targetArr: { age: number; gender: string }[],
    ) => {
      const count = { female: {}, male: {} };
      targetArr.forEach(({ age, gender }) => {
        if (!count[gender][age]) {
          count[gender][age] = 1;
        } else {
          count[gender][age]++;
        }
      });
      return count;
    };

    const { questions, respondents, ...rest } = data;
    const users = countByGenderAndAge(respondents);

    const newQuestions = questions.map((qs) => {
      const { options, textAnswers, type, ...rest } = qs;

      if (type === QuestionTypes.SELECT) {
        const newOptions = options.map((e) => {
          //젠더정리..
          const users = countByGenderAndAge(e.response.map((r) => r.repondent));
          return { ...e, response: users };
        });
        return { type, ...rest, options: newOptions };
      } else if (type === QuestionTypes.TEXT) {
        return { type, ...rest, textAnswers }; // 여기서는 options를 포함하지 않음
      } else {
        throw new BadRequestException('Invalid question type');
      }
    });

    return { ...rest, respodents: users, questions: newQuestions };
  }
}
