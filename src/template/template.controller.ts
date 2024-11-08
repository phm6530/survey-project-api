import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from 'src/template/dto/create-template.dto';
import { DataSource } from 'typeorm';
import { withTransaction } from 'lib/withTransaction.lib';
import { TEMPLATE_TYPE } from 'type/template';
import { TokenGuard } from 'src/auth/guard/token.guard';

export type GetTemplateParams = {
  template: TEMPLATE_TYPE;
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
  @UseGuards(TokenGuard)
  async createTemplate(
    @Param('template') template: TEMPLATE_TYPE,
    @Body() body: CreateTemplateDto,
  ) {
    const templateId = await withTransaction(this.dataSource, async (qr) => {
      const { questions, ...metadata } = body;

      //Meta
      const meta = await this.templateService.createTemplateMeta(
        { ...metadata },
        qr,
      );

      switch (template) {
        case TEMPLATE_TYPE.SURVEY: {
          await this.templateService.createSurveyQustions(questions, qr, meta);
          return meta.id;
        }
        default:
          throw new BadRequestException('잘못된 요청입니다.');
      }
    });

    return {
      statusCode: 201,
      data: { templateId },
    };
  }

  // Detail 페이지 가져오기
  @Get(':template/:id')
  // @UseGuards(TokenGuard)
  getTemplate(@Param() params: GetTemplateParams) {
    console.count('멋번요청?');
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
