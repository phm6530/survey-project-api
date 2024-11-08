import { TEMPLATE_TYPE } from './../../type/template';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createClient } from '@supabase/supabase-js';
import { extname } from 'path';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { QueryRunner, Repository } from 'typeorm';
import { v4 as uuid4 } from 'uuid';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(TemplateMetaModel)
    private readonly templatemetaRepository: Repository<TemplateMetaModel>,
    private readonly configService: ConfigService,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<TemplateMetaModel>(TemplateMetaModel)
      : this.templatemetaRepository;
  }

  //template 존재여부
  async isExistTemplate(
    { id, templateType }: { id: number; templateType: TEMPLATE_TYPE },
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

  async uploadFileSupabase(
    file: Express.Multer.File,
    key: string,
  ): Promise<string | null> {
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');

    const supabase = createClient(supabaseUrl, supabaseKey);

    const uniqueFileName = `${uuid4()}${extname(file.originalname)}`;

    //파일업로드
    const { data, error } = await supabase.storage
      .from('images')
      .upload(`temp/${key}/${uniqueFileName}`, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.log(error);
      throw new Error('파일 업로드 실패');
    }

    // 공개 url 전달
    const { data: publicData } = supabase.storage
      .from('images')
      .getPublicUrl(`temp/${key}/${uniqueFileName}`);

    return publicData.publicUrl || null;
  }
}
