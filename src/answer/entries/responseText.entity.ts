import { RespondentModel } from 'src/answer/entries/respondent.entity';
import { SurveyQuestion } from 'src/template/entries/survey/survey-questions.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class responseText {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  answer: string;

  @ManyToOne(() => RespondentModel, (respondent) => respondent.textAnswers, {
    onDelete: 'CASCADE',
  })
  respondent: RespondentModel;

  @ManyToOne(() => SurveyQuestion, (question) => question.textAnswers, {
    onDelete: 'CASCADE',
  })
  question: SurveyQuestion;
}
