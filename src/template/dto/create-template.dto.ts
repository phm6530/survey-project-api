import { Type } from 'class-transformer';
import { ArrayMinSize, ValidateNested } from 'class-validator';

import { CreateMetadataDto } from 'src/template/dto/create-metadata.dto';
import { SurveyQuestionDto } from 'src/template/dto/survey-question.dto';

//Template DTO
export class CreateTemplateDto extends CreateMetadataDto {
  @ArrayMinSize(1, { message: '문항은 하나 이상 등록되어야 합니다.' }) // questions 배열이 최소 1개 이상이어야 함
  @Type(() => SurveyQuestionDto)
  @ValidateNested({ each: true })
  questions: SurveyQuestionDto[];
}
