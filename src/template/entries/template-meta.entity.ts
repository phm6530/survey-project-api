import { RespondentModel } from 'src/answer/entries/respondent.entity';
import { BaseModel } from 'src/common/entries/base.entity';
import { SurveyQuestion } from 'src/template/entries/survey/survey-questions.entity';
import { UserModel } from 'src/user/entries/user.entity';
import { TEMPLATE_TYPE } from 'type/template';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('template_metadata')
export class TemplateMetaModel extends BaseModel {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ enum: TEMPLATE_TYPE })
  templateType: TEMPLATE_TYPE;

  @Column()
  isGenderCollected: boolean;

  @Column()
  isAgeCollected: boolean;

  @Column({ nullable: true })
  templateKey: string;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column()
  thumbnail: string;

  @OneToMany(() => SurveyQuestion, (questions) => questions.templateMeta, {})
  questions: SurveyQuestion[];

  //참여자 통계를 위한 관계서정함
  @OneToMany(() => RespondentModel, (respondent) => respondent.template, {})
  respondents: RespondentModel[];

  //생성한유저
  @ManyToOne(() => UserModel, (user) => user.templates)
  creator: UserModel;
}
