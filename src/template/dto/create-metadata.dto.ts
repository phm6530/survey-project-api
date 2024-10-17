import { PickType } from '@nestjs/mapped-types';
import { IsBoolean, IsDate, IsEnum, IsString } from 'class-validator';
import {
  TemplateMetaModel,
  TemplateType,
} from 'src/template/entries/template-meta.entity';

//template 메타데이터
export class CreateMetadataDto extends PickType(TemplateMetaModel, [
  'title',
  'description',
  'templateType',
  'isGenderCallrected',
  'isAgeCollected',
  'startDate',
  'endDate',
  'thumbnail',
]) {
  @IsString()
  title: string;

  @IsString()
  description: string;

  //설문조사의 썸네일
  @IsString()
  thumbnail: string;

  //성별 집계
  @IsBoolean()
  isGenderCallrected: boolean;

  //나이 집계
  @IsBoolean()
  isAgeCollected: boolean;

  //템플릿 타입
  @IsEnum(TemplateType)
  templateType: TemplateType;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;
}
