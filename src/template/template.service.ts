import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateTemplateDto } from 'src/template/dto/create-template.dto';
import {
  TemplateMetaModel,
  TemplateType,
} from 'src/template/entries/template-meta.entity';
import { QueryRunner, Repository } from 'typeorm';
import { SurveyQuestionDto } from 'src/template/dto/survey-question.dto';
import { SurveyQuestion } from 'src/template/entries/survey/survey-questions.entity';
import { QustionOption } from 'src/template/entries/survey/survey-option.entity';
import { QuestionOptionsDto } from 'src/template/dto/survey-option.dto';
import { InjectRepository } from '@nestjs/typeorm';

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
    return await this.templateRepository.find();
  }

  //get By Id
  async getTemplateById(templetType: TemplateType, id: number) {
    const item = await this.templateRepository.findOne({
      where: { id, templateType: templetType },
      relations: ['questions', 'questions.options'],
    });

    if (!item) {
      throw new NotFoundException('없는페이지');
    }

    return item;
  }
}
