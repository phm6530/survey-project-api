import { PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { TEMPLATE_TYPE } from 'type/template';

class CreatorDto {
  @IsNumber()
  id: number;

  @IsEmail()
  email: string;
}

//template 메타데이터
export class CreateMetadataDto extends PickType(TemplateMetaModel, [
  'title',
  'description',
  'templateType',
  'isGenderCollected',
  'isAgeCollected',
  // 'startDate',
  // 'endDate',
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
  isGenderCollected: boolean;

  //나이 집계
  @IsBoolean()
  isAgeCollected: boolean;

  //템플릿 타입
  @IsEnum(TEMPLATE_TYPE)
  templateType: TEMPLATE_TYPE;

  @Type(() => Date)
  @IsOptional()
  startDate: Date;

  @IsString()
  templateKey: string;

  @Type(() => Date)
  @IsOptional()
  //class trasform lib는 모두 옵셔널로처리함 떄문에 is Not Empty 처리하는것도 좋음ㅇㅇ
  endDate: Date;

  @IsObject()
  creator: CreatorDto;
}
