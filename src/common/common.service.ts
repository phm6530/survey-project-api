import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createClient } from '@supabase/supabase-js';

import { extname } from 'path';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { QueryRunner, Repository } from 'typeorm';
import { v4 as uuid4 } from 'uuid';
import dayjs from '../../util/dayjs.util';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(TemplateMetaModel)
    private readonly templatemetaRepository: Repository<TemplateMetaModel>,
    private readonly configService: ConfigService,
  ) {}

  public addPin(length: number) {
    //거듭제곱으로 길이 계산
    const startNum = Math.pow(10, length - 1);
    const endNum = Math.pow(10, length) - 1;

    return Math.floor(startNum + Math.random() * (endNum - startNum + 1));
  }

  public getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<TemplateMetaModel>(TemplateMetaModel)
      : this.templatemetaRepository;
  }

  //template 존재여부
  public async isExistTemplate({ id }: { id: number }, qr?: QueryRunner) {
    const templateMeta = this.getRepository(qr);
    const template = await templateMeta.findOne({
      where: { id },
    });
    console.log(template);

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
    const { error } = await supabase.storage
      .from('images')
      .upload(`temp/${key}/${uniqueFileName}`, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new Error('파일 업로드 실패');
    }

    // 공개 url 전달
    const { data: publicData } = supabase.storage
      .from('images')
      .getPublicUrl(`temp/${key}/${uniqueFileName}`);

    return publicData.publicUrl || null;
  }

  //다음페이지가 있는지 확인
  async isExistInfinityScrollNextPage(
    repository: Repository<TemplateMetaModel>,
    curPageCnt: any[],
    offset: number,
    userId: number,
  ) {
    const listDataCnt = userId
      ? await repository.count({
          where: {
            creator: {
              id: userId,
            },
          },
        })
      : await repository.count({});

    return listDataCnt > curPageCnt.length + offset;
  }

  public transformTimeformat(
    date: string | Date,
    format: string = 'YYYY-MM-DD HH:mm:ss',
  ) {
    return dayjs(date).utc(true).tz('Asia/Seoul').format(format);
  }

  public parseTime(time: string | number): number {
    if (typeof time === 'number') {
      return time; // 이미 초 단위라면 그대로 반환
    }

    const matches = time.match(/^(\d+)([smhdy])$/);
    if (!matches) {
      throw new Error('Invalid time format');
    }

    const [, value, unit] = matches;
    const num = parseInt(value, 10);

    switch (unit) {
      case 's':
        return num; // 초
      case 'm':
        return num * 60; // 분 -> 초
      case 'h':
        return num * 3600; // 시 -> 초
      case 'd':
        return num * 86400; // 일 -> 초
      case 'y':
        return num * 31536000; // 년 -> 초
      default:
        throw new Error('Invalid time unit');
    }
  }
}
