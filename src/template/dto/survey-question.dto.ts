import { PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { QuestionOptionsDto } from 'src/template/dto/survey-option.dto';
import {
  QuestionTypes,
  SurveyQuestion,
} from 'src/template/entries/survey/survey-questions.entity';

export class SurveyQuestionDto extends PickType(SurveyQuestion, ['label']) {
  // 문항
  @IsString()
  label: string;

  //무슨 문항인지? 주관 / 객관
  @IsEnum(QuestionTypes)
  type: QuestionTypes;

  //무슨 문항인지? 주관 / 객관
  @IsOptional()
  @IsString()
  optionPicture?: string;

  //무슨 문항인지? 주관 / 객관
  @ValidateIf((o) => o.type === QuestionTypes.SELECT) // 객관식일 때만 options 필수
  @ArrayMinSize(2, { message: '객관식은 항목을 최소 2가지 이상 설정해주세요' })
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionsDto)
  options?: QuestionOptionsDto[];
}
