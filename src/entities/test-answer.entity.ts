import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { TestAttempt } from './test-attempt.entity';
import { QuizQuestion } from './quiz-question.entity';

@Entity('test_answers')
export class TestAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TestAttempt, (attempt) => attempt.answers)
  attempt: TestAttempt;

  @ManyToOne(() => QuizQuestion, (question) => question.testAnswers)
  question: QuizQuestion;

  @Column('text', { array: true, nullable: true })
  selectedAnswers: string[];

  @Column({ default: false })
  isCorrect: boolean;

  @Column({ nullable: true })
  timeSpent: number; // thời gian làm câu này (giây)

  @CreateDateColumn()
  answeredAt: Date;
}
