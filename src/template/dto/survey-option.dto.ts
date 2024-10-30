import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { QuestionTypes } from 'src/template/entries/survey/survey-questions.entity';

export class QuestionOptionsDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsEnum(QuestionTypes)
  type: QuestionTypes;

  @IsString()
  @IsOptional()
  optionPicture?: string;
}
