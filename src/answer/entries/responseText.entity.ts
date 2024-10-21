import { IsString } from 'class-validator';
import { RespondentModel } from 'src/answer/entries/respondent.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class responseText {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  answer: string;

  @ManyToOne(() => RespondentModel)
  respondent: RespondentModel[];
}
