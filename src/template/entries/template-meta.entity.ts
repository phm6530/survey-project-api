import { BaseModel } from 'src/common/entries/base.entity';
import { Column, Entity } from 'typeorm';

export enum templateType {
  SURVEY = 'survey',
  RANK = 'rank',
}

@Entity('template_metadata')
export class TemplateMetaModel extends BaseModel {
  @Column()
  title: string;

  @Column()
  gender: boolean;

  @Column()
  description: string;

  @Column({ enum: templateType })
  templateType: templateType;

  @Column()
  age: boolean;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  thumbnail: string;
}
