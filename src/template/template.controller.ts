import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from 'src/template/dto/create-template.dto';
import { DataSource } from 'typeorm';
import { withTransaction } from 'lib/withTransaction.lib';
import { TemplateType } from 'type/template';

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

  //리스트 가져오기
  @Get()
  async getList(@Query() query?: QsGetList) {
    console.log(query);

    // await new Promise((resolve) => setTimeout(resolve, 3000));
    const data = await this.templateService.getlist();

    return data;
  }

  // 설문조사 템플릿 생성
  @Post(':template')
  async createTemplate(
    @Param('template') template: TemplateType,
    @Body() body: CreateTemplateDto,
  ) {
    const templateId = await withTransaction(this.dataSource, async (qr) => {
      const { questions, ...metadata } = body;
      //Meta
      const meta = await this.templateService.createTemplateMeta(
        { ...metadata },
        qr,
      );

      if (template === 'survey') {
        //Questions
        await this.templateService.createSurveyQustions(questions, qr, meta);
        return meta.id;
      }
    });

    return {
      statusCode: 201,
      data: { templateId },
    };
  }

  // Detail 페이지 가져오기
  @Get(':template/:id')
  getTemplate(@Param() params: GetTemplateParams) {
    const { template, id } = params;
    return this.templateService.getTemplateById(template, id);
  }

  // 삭제
  @Delete(':template/:id')
  deleteTemplate(@Param() params: GetTemplateParams) {
    const { template, id } = params;
    return this.templateService.deleteTemplateById({ template, id });
  }
}
