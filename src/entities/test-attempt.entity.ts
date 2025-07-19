import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Test } from './test.entity';
import { TestAnswer } from './test-answer.entity';

export enum AttemptStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled',
}

@Entity('test_attempts')
export class TestAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.testAttempts)
  user: User;

  @ManyToOne(() => Test, (test) => test.attempts)
  test: Test;

  @OneToMany(() => TestAnswer, (answer) => answer.attempt)
  answers: TestAnswer[];

  @Column({
    type: 'enum',
    enum: AttemptStatus,
    default: AttemptStatus.IN_PROGRESS,
  })
  status: AttemptStatus;

  @Column()
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number; // điểm số (%)

  @Column({ default: 0 })
  correctAnswers: number;

  @Column({ default: 0 })
  totalQuestions: number;

  @Column({ nullable: true })
  timeSpent: number; // thời gian làm bài thực tế (giây)

  @Column({ default: false })
  isPassed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
