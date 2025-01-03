import { AnswerModel } from 'src/answer/entries/responseSelect.entity';
import {
  QuestionTypes,
  SurveyQuestion,
} from 'src/template/entries/survey/survey-questions.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**객관식 컬럼임  */
@Entity()
export class QustionOption {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column()
  // label: string;

  @Column()
  value: string;

  @Column({ enum: QuestionTypes })
  type: QuestionTypes;

  @Column({ nullable: true })
  img: string;

  @ManyToOne(() => SurveyQuestion, (Questions) => Questions.options, {
    onDelete: 'CASCADE',
  })
  question: SurveyQuestion;

  @OneToMany(() => AnswerModel, (answer) => answer.question)
  response: AnswerModel[];
}
