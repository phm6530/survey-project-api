import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from 'src/template/dto/create-template.dto';
import { DataSource } from 'typeorm';
import { withTransaction } from 'lib/withTransaction.lib';
import { TemplateType } from 'src/template/entries/template-meta.entity';

export type GetTemplateParams = {
  template: TemplateType;
  id: number;
};

export type QsGetList = { sort: 'all' | 'user' | 'male' | 'female' };

@Controller('template')
export class TemplateController {
  constructor(
    private readonly templateService: TemplateService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  async getList(@Query() query?: QsGetList) {
    const { sort } = query;
    console.log(sort);
    return await this.templateService.getlist();
  }

  // 설문조사 템플릿 생성
  @Post(':template')
  async createTemplate(
    @Param('template') template: TemplateType,
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

  // Detail 페이지 가져오기
  @Get(':template/:id')
  getTemplate(@Param() params: GetTemplateParams) {
    const { template, id } = params;
    return this.templateService.getTemplateById(template, id);
  }

  //응답
  // @Post(':template/:id')
  // postAnswer(@Param() Params: any, @Body() body: any) {}
}
