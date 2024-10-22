import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateTemplateDto } from 'src/template/dto/create-template.dto';
import {
  TemplateMetaModel,
  TemplateType,
} from 'src/template/entries/template-meta.entity';
import { QueryRunner, Repository } from 'typeorm';
import { SurveyQuestionDto } from 'src/template/dto/survey-question.dto';
import {
  QuestionTypes,
  SurveyQuestion,
} from 'src/template/entries/survey/survey-questions.entity';
import { QustionOption } from 'src/template/entries/survey/survey-option.entity';
import { QuestionOptionsDto } from 'src/template/dto/survey-option.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GetTemplateParams } from 'src/template/template.controller';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(TemplateMetaModel)
    private readonly templateRepository: Repository<TemplateMetaModel>,
  ) {}

  //설문조사 META 생성
  async createTemplateMeta(
    body: Omit<CreateTemplateDto, 'questions'>,
    qr: QueryRunner,
  ) {
    //트랜잭션 사용
    const repository =
      qr.manager.getRepository<TemplateMetaModel>(TemplateMetaModel);

    const instance = repository.create(body);
    return await repository.save(instance);
  }

  //create Survey Questions..
  async createSurveyQustions(
    questions: SurveyQuestionDto[],
    qr: QueryRunner,
    meta: TemplateMetaModel,
  ) {
    const repository = qr.manager.getRepository<SurveyQuestion>(SurveyQuestion);

    for (const item of questions) {
      // for...of 사용
      const entity = repository.create({ ...item, templateMeta: meta });
      const question = await repository.save(entity); // 비동기 작업을 기다림

      // 객관식 처리
      if (item.type === 'select') {
        for (const option of item.options) {
          // for...of 사용
          await this.createSurveyOptions(option, question, qr); // 비동기 작업을 기다림
        }
      }
    }
  }

  // 객관식 옵션 생성
  async createSurveyOptions(
    option: QuestionOptionsDto,
    question: SurveyQuestionDto,
    qr: QueryRunner,
  ) {
    const repository = qr.manager.getRepository<QustionOption>(QustionOption);
    const entity = repository.create({ ...option, question });
    await repository.save(entity);
  }

  // get List
  async getlist() {
    //get List..
    const data = this.templateRepository
      .createQueryBuilder('template')
      .leftJoin('template.respondents', 'respondents')
      .addSelect(['respondents.id', 'respondents.gender', 'respondents.age'])
      .getMany();

    const tester = (await data).map((templateInfo) => {
      const { respondents, ...rest } = templateInfo;

      const filterData = { female: {}, male: {} };

      respondents.forEach((e) => {
        if (!filterData[e.gender][e.age]) {
          filterData[e.gender][e.age] = 1;
          return;
        }
        filterData[e.gender][e.age]++;
      });

      return {
        ...rest,
        respondents: { allCnt: respondents.length, detail: filterData },
      };
    });

    return tester;
  }

  //get By Id
  async getTemplateById(templetType: TemplateType, id: number) {
    const isExistTemplate = await this.templateRepository.findOne({
      where: { id, templateType: templetType },
      relations: ['questions', 'questions.options', 'respondents'],
    });

    if (!isExistTemplate) {
      throw new NotFoundException('없는페이지');
    }

    //Options 제거
    const { questions, ...rest } = isExistTemplate;

    const questionsTemp = questions.map((qs) => {
      if (qs.type === QuestionTypes.TEXT) {
        //주관식 Options 프로퍼티 삭제
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { options, ...rest } = qs;
        return rest;
      }
      return qs;
    });

    return { ...rest, questions: questionsTemp };
  }

  async deleteTemplateById({ template, id }: GetTemplateParams) {
    const isExist = await this.templateRepository.findOne({
      where: { id, templateType: template },
    });
    if (!isExist) {
      throw new NotFoundException('이미 삭제되었거나 잘못된 요청입니다.');
    }

    await this.templateRepository.delete({ id, templateType: template });
  }
}
