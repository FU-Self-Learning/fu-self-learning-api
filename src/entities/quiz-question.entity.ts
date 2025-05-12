import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Topic } from './topic.entity';
import { QuizResult } from './quiz-result.entity';

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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
