import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(TemplateMetaModel)
    private readonly templateRepository: Repository<TemplateMetaModel>,
  ) {}

  //설문조사 생성
  async createSurvey() {
    return this.templateRepository.create();
  }
}
