import { RespondentModel } from 'src/answer/entries/respondent.entity';
import { QustionOption } from 'src/template/entries/survey/survey-option.entity';
import { SurveyQuestion } from 'src/template/entries/survey/survey-questions.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class AnswerModel {
  @PrimaryGeneratedColumn()
  id: number;

  //문제랑 답변이랑 One to One 관계설정
  @ManyToOne(() => SurveyQuestion, (question) => question.response, {
    onDelete: 'CASCADE',
  })
  question: SurveyQuestion;

  //주관식일떄
  @Column({ nullable: true })
  answer: string;

  //객관식일때는 option의 value 가져오기 ㅇㅇ

  // 성별 + 나이 집계 하지않을 수도 있기 때문에 nullable 처리
  @ManyToOne(() => QustionOption, (question) => question.response, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  option: QustionOption;

  @ManyToOne(() => RespondentModel, (respondent) => respondent.answer, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  repondent: RespondentModel;
}
