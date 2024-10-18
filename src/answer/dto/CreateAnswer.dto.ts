import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AgeGroup, GenderGrop } from 'src/answer/entries/respondent.entity';
import { QuestionTypes } from 'src/template/entries/survey/survey-questions.entity';

class AnswerDto {
  @IsNumber()
  @Type(() => Number)
  questionId: number;

  @IsEnum(QuestionTypes)
  type: QuestionTypes;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  optionId?: number;

  @IsOptional()
  @IsString()
  answer?: string;
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
