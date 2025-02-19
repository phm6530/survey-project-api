import { responseText } from 'src/answer/entries/responseText.entity';
import { QustionOption } from 'src/template/entries/survey/survey-option.entity';
import { TemplateMetaModel } from 'src/template/entries/template-meta.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum QuestionTypes {
  SELECT = 'select',
  TEXT = 'text',
}

//설문조사 템플릿 질문항목
/**
 * 객관식은 1:1이기때문에 굳이 필요 없어서 만들지 않았음
 */

@Entity()
export class SurveyQuestion {
  // 여러 개의 Survey가 하나의 Template에 속할 수 있음
  // 종속하는 template 연결
  @ManyToOne(
    () => TemplateMetaModel,
    (templateMeta) => templateMeta.questions,
    {
      onDelete: 'CASCADE',
    },
  )
  templateMeta: TemplateMetaModel;

  @PrimaryGeneratedColumn()
  id: number;

  //주관식 or 객관식
  @Column({ enum: QuestionTypes })
  type: QuestionTypes;

  //설문 문제
  @Column()
  label: string;

  @Column({ nullable: true })
  img: string;

  // 필수는 항상 true
  @Column({ default: true })
  required: boolean;

  // 복수 선택은 항상 false ..
  @Column({ default: false })
  multi_select: boolean;

  //객관식 일 때 Option 연결
  @OneToMany(() => QustionOption, (option) => option.question, {
    nullable: true,
  })
  options?: QustionOption[];

  //주관식일때는 Answer로 연결
  @OneToMany(() => responseText, (answer) => answer.question, { cascade: true })
  textAnswers: responseText[];
}
