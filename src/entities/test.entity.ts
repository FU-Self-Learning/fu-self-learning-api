import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Course } from './course.entity';
import { Topic } from './topic.entity';
import { QuizQuestion } from './quiz-question.entity';
import { TestAttempt } from './test-attempt.entity';

export enum TestType {
  PRACTICE = 'practice',
  TOPIC_EXAM = 'topic_exam',
  FINAL_EXAM = 'final_exam',
}

@Entity('tests')
export class Test {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @ManyToOne(() => Course, (course) => course.tests)
  course: Course;

  @ManyToOne(() => Topic, (topic) => topic.tests, { nullable: true })
  topic: Topic; // For Topic Exam, link to specific topic

  @ManyToMany(() => Topic, (topic) => topic.tests)
  @JoinTable()
  topics: Topic[];

  @ManyToMany(() => QuizQuestion, (question) => question.tests)
  @JoinTable()
  questions: QuizQuestion[];

  @OneToMany(() => TestAttempt, (attempt) => attempt.test)
  attempts: TestAttempt[];

  @Column({ type: 'enum', enum: TestType, default: TestType.PRACTICE })
  type: TestType;

  @Column({ default: 60 }) // thời gian làm bài (phút)
  duration: number;

  @Column({ default: 10 }) // số câu hỏi
  questionCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 60.0 }) // điểm tối thiểu để đậu (%)
  passingScore: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false }) // có trộn câu hỏi không
  shuffleQuestions: boolean;

  @Column({ default: false }) // có trộn đáp án không
  shuffleAnswers: boolean;

  @Column({ default: false }) // có yêu cầu hoàn thành video trước khi làm bài không
  requireVideoCompletion: boolean;

  @Column({ default: 0 }) // thứ tự hiển thị
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 