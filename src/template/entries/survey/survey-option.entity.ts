import { ResponseModel } from 'src/template/entries/response/response.entity';
import {
  QuestionTypes,
  SurveyQuestion,
} from 'src/template/entries/survey/survey-questions.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @OneToOne(() => ResponseModel, (response) => response.question)
  response: ResponseModel;
}
