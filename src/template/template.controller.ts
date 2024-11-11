import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from 'src/template/dto/create-template.dto';
import { DataSource, Repository } from 'typeorm';
import { withTransaction, withTransactions } from 'lib/withTransaction.lib';
import { TEMPLATE_TYPE, TEMPLATERLIST_SORT } from 'type/template';
import { TokenGuard } from 'src/auth/guard/token.guard';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { CommonService } from 'src/common/common.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ExistUserTemplate } from 'src/template/interceptor/existUserTemplate';

export type GetTemplateParams = {
  template: TEMPLATE_TYPE;
  id: number;
};

@Controller('template')
export class TemplateController {
  constructor(
    private readonly templateService: TemplateService,
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
    @InjectRepository(TemplateMetaModel)
    private readonly templatemetaRepository: Repository<TemplateMetaModel>,
  ) {}

  //리스트 가져오기
  @Get()
  async getList(@Query() query?: { sort?: TEMPLATERLIST_SORT; page?: number }) {
    return await this.templateService.getList({
      sort: query.sort,
      page: +query.page,
    });
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

      if (meta instanceof TemplateMetaModel) {
        switch (template) {
          case TEMPLATE_TYPE.SURVEY: {
            await this.templateService.createSurveyQustions(
              questions,
              qr,
              meta,
            );
            return meta.id;
          }
          default:
            throw new BadRequestException('잘못된 요청입니다.');
        }
      }
    });

    return {
      statusCode: 201,
      data: { templateId },
    };
  }

  // 설문조사 템플릿 생성
  // Patch보단 Put으로 갈음처리해버림
  @Put(':template/:id')
  @UseGuards(TokenGuard)
  @UseInterceptors()
  async PutTemplate(
    @Param() params: GetTemplateParams,
    @Body() body: CreateTemplateDto,
    @Req() req: any,
  ) {
    const transaction = new withTransactions(this.dataSource);
    const existsTemplate = await this.templateService.existTemplate(params.id);

    /**
     * 생성한 사용자가 아닐 경우 막기
     */
    if (
      !existsTemplate ||
      existsTemplate?.creator?.email !== req?.user?.email
    ) {
      throw new BadRequestException('잘못된 요청입니다.');
    }

    // 존재하면..
    if (existsTemplate) {
      const { questions, ...rest } = body;

      const patchTemplate = await transaction.execute(async (qr) => {
        const meta = await this.templateService.createTemplateMeta(
          { ...rest },
          qr,
          existsTemplate,
        );

        console.log(meta);
        // await this.templateService.createSurveyQustions();
      });

      return {
        statusCode: 201,
        patchTemplate,
      };
    } else {
      throw new BadRequestException('Error...');
    }
  }

  // Detail 페이지 가져오기
  @Post(':template/:id')
  // @UseGuards(TokenGuard)
  @UseInterceptors(ExistUserTemplate)
  async getTemplate(@Param() params: GetTemplateParams) {
    const { template, id } = params;
    await this.templateService.existTemplate(params.id);
    return this.templateService.getTemplateById(template, id);
  }

  // 삭제
  @Delete(':template/:id')
  deleteTemplate(@Param() params: GetTemplateParams) {
    const { template, id } = params;
    return this.templateService.deleteTemplateById({ template, id });
  }
}
