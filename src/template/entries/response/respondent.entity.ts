import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

enum GenderGrop {
  MALE = 'male',
  FEMALE = 'female',
}

@Entity()
export class Respondent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  age: number;

  @Column({ enum: GenderGrop, nullable: true })
  gender: GenderGrop; // 성별

  @Column()
  isAnonymous: boolean;

  // // 익명 사용자의 경우 추가로 이메일 인증을 저장
  // @Column({ type: 'varchar', length: 255, nullable: true })
  // anonymousEmail: string | null;

  // @Column({ type: 'varchar', length: 255, nullable: true })
  // verificationCode: string | null; // 익명 인증번호
}
