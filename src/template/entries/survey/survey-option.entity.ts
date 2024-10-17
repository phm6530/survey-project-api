import {
  QuestionTypes,
  SurveyQuestion,
} from 'src/template/entries/survey/survey-questions.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

/**객관식 컬럼임  */
@Entity()
export class QustionOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column()
  value: string;

  @Column({ enum: QuestionTypes })
  type: QuestionTypes;

  @Column({ nullable: true })
  optionPicture: string;

  @ManyToOne(() => SurveyQuestion, (Questions) => Questions.options)
  question: SurveyQuestion;
}
