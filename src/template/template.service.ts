import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTemplateDto } from 'src/template/dto/create-template.dto';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { QueryRunner, Repository } from 'typeorm';
import { SurveyQuestionDto } from 'src/template/dto/survey-question.dto';
import { SurveyQuestion } from 'src/template/entries/survey/survey-questions.entity';

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

    questions.forEach(async (item) => {
      const entity = repository.create({ ...item, templateMeta: meta });
      // 주관식 + 객관식
      await repository.save(entity);

      // 객관식 처리
      if (item.type === 'select') {
        return 1;
      }
    });
  }
}
