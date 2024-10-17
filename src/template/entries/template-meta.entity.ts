import { BaseModel } from 'src/common/entries/base.entity';
import { SurveyQuestion } from 'src/template/entries/survey/survey-questions.entity';
import { Column, Entity, OneToMany } from 'typeorm';

export enum TemplateType {
  SURVEY = 'survey',
  RANK = 'rank',
}

@Entity('template_metadata')
export class TemplateMetaModel extends BaseModel {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ enum: TemplateType })
  templateType: TemplateType;

  @Column()
  isGenderCallrected: boolean;

  @Column()
  isAgeCollected: boolean;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  thumbnail: string;

  @OneToMany(() => SurveyQuestion, (questions) => questions.templateMeta)
  questions: SurveyQuestion[];
}
