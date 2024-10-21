import { Module } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { AnswerController } from './answer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import { AnswerModel } from 'src/answer/entries/responseSelect.entity';
import { RespondentModel } from 'src/answer/entries/respondent.entity';
import { responseText } from 'src/answer/entries/responseText.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TemplateMetaModel,
      AnswerModel,
      RespondentModel,
      responseText,
    ]),
  ],
  controllers: [AnswerController],
  providers: [AnswerService],
})
export class AnswerModule {}
