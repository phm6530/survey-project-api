import { Body, Controller, Param, Post } from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from 'src/template/dto/create-template.dto';
// import { CreateTemplateDto } from 'src/template/dto/create-template.dto';

export enum templateType {
  SURVEY = 'survey',
  RANK = 'rank',
}

//Post Data

// {
//   title: '365262',
//   description: '62626',
//   thumbnail: '/_upload/survey/f32668ee-e51c-4e9b-9e5e-b0a56243f0d7/2024-10-17T05_29_02.160Z.jpg',
//   genderChk: '1',
//   ageChk: '1',
//   dateRange: null,
//   items: [ { id: 1, label: 'ㄷ', type: 'text' } ],
//   template: 'survey',
//   template_key: 'f32668ee-e51c-4e9b-9e5e-b0a56243f0d7'
// }

@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post(':template')
  postTemplate(
    @Param('template') template: templateType,
    @Body() body: CreateTemplateDto,
  ) {
    console.log(body);
    if (template === 'survey') {
      return this.templateService.createSurvey();
    }
  }
}
