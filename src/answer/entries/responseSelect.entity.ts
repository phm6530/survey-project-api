import { RespondentModel } from 'src/answer/entries/respondent.entity';
import { QustionOption } from 'src/template/entries/survey/survey-option.entity';

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AnswerModel {
  @PrimaryGeneratedColumn()
  id: number;

  //주관식일떄
  @Column({ nullable: true })
  answer: string;

  //객관식일때는 option의 value 가져오기 ㅇㅇ

  // 성별 + 나이 집계 하지않을 수도 있기 때문에 nullable 처리
  @ManyToOne(() => QustionOption, (question) => question.response, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  question: QustionOption;

  @ManyToOne(() => RespondentModel, (respondent) => respondent.answer, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  repondent: RespondentModel;
}
