import { AnswerModel } from 'src/answer/entries/answer.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

enum GenderGrop {
  MALE = 'male',
  FEMALE = 'female',
}

type ageGroup = 10 | 20 | 30 | 40 | 50 | 60;

@Entity()
export class RespondentModel {
  @PrimaryGeneratedColumn()
  id: number;

  // 연령대
  @Column({ nullable: true })
  age: ageGroup;

  // 성별
  @Column({ enum: GenderGrop, nullable: true })
  gender: GenderGrop;

  //응답
  @OneToMany(() => AnswerModel, (answer) => answer.repondent)
  answer: AnswerModel;
}
