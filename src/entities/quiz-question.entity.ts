import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Topic } from './topic.entity';
import { QuizResult } from './quiz-result.entity';
import { Test } from './test.entity';
import { TestAnswer } from './test-answer.entity';

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  question_text: string;

  @Column('text', { array: true })
  correct_answer: string[];

  @Column('text', { array: true })
  choices: string[];

  @ManyToOne(() => Topic, (topic) => topic.quizQuestions)
  topic: Topic;

  @OneToMany(() => QuizResult, (result) => result.question)
  results: QuizResult[];

  @ManyToMany(() => Test, (test) => test.questions)
  tests: Test[];

  @OneToMany(() => TestAnswer, (answer) => answer.question)
  testAnswers: TestAnswer[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
