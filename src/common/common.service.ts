import { TemplateType } from './../../type/template';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(TemplateMetaModel)
    private readonly templatemetaRepository: Repository<TemplateMetaModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<TemplateMetaModel>(TemplateMetaModel)
      : this.templatemetaRepository;
  }

  //template 존재여부
  async isExistTemplate(
    { id, templateType }: { id: number; templateType: TemplateType },
    qr?: QueryRunner,
  ) {
    const templateMeta = this.getRepository(qr);
    const template = await templateMeta.findOne({
      where: { id, templateType: templateType },
    });

    if (!template) {
      throw new NotFoundException('이미 삭제되었거나 잘못된 요청입니다.');
    }

    return template;
  }
}
