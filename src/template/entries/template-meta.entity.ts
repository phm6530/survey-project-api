import { RespondentModel } from 'src/answer/entries/respondent.entity';
import { CommentModel } from 'src/comment/entries/comment.entity';
import { BaseModel } from 'src/common/entries/base.entity';
import { SurveyQuestion } from 'src/template/entries/survey/survey-questions.entity';
import { TemplateType } from 'type/template';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('template_metadata')
export class TemplateMetaModel extends BaseModel {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ enum: TemplateType })
  templateType: TemplateType;

  @Column()
  isGenderCollected: boolean;

  @Column()
  isAgeCollected: boolean;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column()
  thumbnail: string;

  @OneToMany(() => SurveyQuestion, (questions) => questions.templateMeta, {
    cascade: ['remove'],
  })
  questions: SurveyQuestion[];

  //참여자 통계를 위한 관계서정함
  @OneToMany(() => RespondentModel, (respondent) => respondent.template, {
    cascade: ['remove'],
  })
  respondents: RespondentModel[];

  //템플릿에 대한 댓글
  @OneToMany(() => CommentModel, (comment) => comment.template)
  comments: CommentModel[];
}
