import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AgeGroup, GenderGrop } from 'src/answer/entries/respondent.entity';
import { QuestionTypes } from 'src/template/entries/survey/survey-questions.entity';

class OptionMap {
  [key: string]: number;
}

export class AnswerDto {
  @IsNumber()
  @Type(() => Number)
  questionId: number;

  @IsEnum(QuestionTypes)
  type: QuestionTypes;

  @IsOptional()
  @Type(() => OptionMap) // Transform 과정에서 OptionMap 타입으로 변환
  optionId?: OptionMap[]; // 배열이 아닌 객체로 받기

  @IsOptional()
  @IsString()
  answer?: string;

  @IsBoolean()
  @Type(() => Boolean)
  required: boolean;
}

export class CreateAnswerDto {
  @IsOptional()
  @IsEnum(AgeGroup)
  ageGroup?: AgeGroup;

  @IsOptional()
  @IsEnum(GenderGrop)
  gender?: GenderGrop;

  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
