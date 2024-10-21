import { AnswerModel } from 'src/answer/entries/responseSelect.entity';
import { responseText } from 'src/answer/entries/responseText.entity';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';

export enum GenderGrop {
  MALE = 'male',
  FEMALE = 'female',
}

export enum AgeGroup {
  Ten = 10,
  Twenty = 20,
  Thirty = 30,
  Forty = 40,
  Fifty = 50,
  Sixty = 60,
}

@Entity()
export class RespondentModel {
  @PrimaryGeneratedColumn()
  id: number;

  // 연령대
  @Column({ nullable: true })
  age: AgeGroup;

  // 성별
  @Column({ enum: GenderGrop, nullable: true })
  gender: GenderGrop;

  //객관식 응답
  @OneToMany(() => AnswerModel, (answer) => answer.repondent)
  answer: AnswerModel[];

  //주관식 응답
  @OneToMany(() => responseText, (textAnswer) => textAnswer.respondent)
  textAnswer: responseText;

  @ManyToOne(() => TemplateMetaModel, (template) => template.respondents, {
    onDelete: 'CASCADE',
  })
  // @Exclude({ toPlainOnly: true })
  template: TemplateMetaModel;
}
