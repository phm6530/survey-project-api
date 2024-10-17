import { QustionOption } from 'src/template/entries/survey/survey-option.entity';
import { SurveyQuestion } from 'src/template/entries/survey/survey-questions.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ResponseModel {
  @PrimaryGeneratedColumn()
  id: number;

  //문제랑 답변이랑 One to One 관계설정
  @OneToOne(() => SurveyQuestion, (question) => question.response)
  question: SurveyQuestion;

  //주관식일떄
  @Column({ nullable: true })
  answer: string;

  //객관식일때는 option의 value 가져오기 ㅇㅇ
  @OneToOne(() => QustionOption, (question) => question.response)
  option: QustionOption;
}
