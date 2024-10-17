import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { QuestionTypes } from 'src/template/entries/survey/survey-questions.entity';

export class SurveyQuestionDto {
  @IsNumber()
  id: number;

  // 문항
  @IsString()
  label: string;

  //무슨 문항인지? 주관 / 객관
  @IsEnum(QuestionTypes)
  type: QuestionTypes;

  //사진의 유무는 옵셔널처리
  @IsOptional()
  @IsString()
  optionPicture?: string;

  //객관식일 경우는 릴레이션
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  options?: string[];
}
