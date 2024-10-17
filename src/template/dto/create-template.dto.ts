import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateMetadataDto } from 'src/template/dto/create-metadata.dto';
import { SurveyQuestionDto } from 'src/template/dto/survey-question.dto';

//Template DTO
export class CreateTemplateDto extends CreateMetadataDto {
  @ValidateNested({ each: true })
  @Type(() => SurveyQuestionDto)
  questions: SurveyQuestionDto[];
}
