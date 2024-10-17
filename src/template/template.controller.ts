import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from 'src/template/dto/create-template.dto';
import { DataSource } from 'typeorm';
import { withTransaction } from 'lib/withTransaction.lib';

export enum templateType {
  SURVEY = 'survey',
  RANK = 'rank',
}

export type GetTemplateParams = {
  template: string;
  id: number;
};

@Controller('template')
export class TemplateController {
  constructor(
    private readonly templateService: TemplateService,
    private readonly dataSource: DataSource,
  ) {}

  // 설문조사 템플릿 생성
  @Post(':template')
  async createTemplate(
    @Param('template') template: templateType,
    @Body() body: CreateTemplateDto,
  ) {
    const result = await withTransaction(this.dataSource, async (qr) => {
      const { questions, ...metadata } = body;

      if (template === 'survey') {
        //Meta
        const meta = await this.templateService.createTemplateMeta(
          { ...metadata },
          qr,
        );

        //Questions
        await this.templateService.createSurveyQustions(questions, qr, meta);
        return true;
      }
    });

    return {
      statusCode: 201,
      data: result,
    };
  }

  // Tempalte 가져오기
  @Get(':template/:id')
  getTemplate(@Param() params: GetTemplateParams) {
    console.log(typeof params.id);
    return true;
  }
}
