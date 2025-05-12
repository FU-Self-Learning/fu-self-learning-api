import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { QuizQuestion } from './quiz-question.entity';
import { User } from './user.entity';

@Entity('quiz_results')
export class QuizResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.quizResults)
  user: User;

  @ManyToOne(() => QuizQuestion, (question) => question.results)
  question: QuizQuestion;

  @Column('text', { array: true })
  selected_answer: string[];

  @Column()
  is_correct: boolean;

  @Column()
  answered_at: Date;
}
