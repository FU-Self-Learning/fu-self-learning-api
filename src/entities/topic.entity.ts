import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Course } from './course.entity';
import { Flashcard } from './flashcard.entity';
import { AIContentRequest } from './ai-content-request.entity';
import { StudySession } from './study-session.entity';
import { QuizQuestion } from './quiz-question.entity';
import { Lesson } from './lesson.entity';
import { Test } from './test.entity';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Course, (course) => course.topics)
  course: Course;

  @OneToMany(() => Lesson, (lesson) => lesson.topic)
  lessons: Lesson[];

  @OneToMany(() => Flashcard, (card) => card.topic)
  flashcards: Flashcard[];

  @OneToMany(() => StudySession, (session) => session.topic)
  studySessions: StudySession[];

  @OneToMany(() => AIContentRequest, (request) => request.topic)
  aiContentRequests: AIContentRequest[];

  @OneToMany(() => QuizQuestion, (quizQuestion) => quizQuestion.topic)
  quizQuestions: QuizQuestion[];

  @ManyToMany(() => Test, (test) => test.topics)
  tests: Test[];

  @OneToMany(() => Test, (test) => test.topic)
  topicExam: Test; // Topic Exam for this topic

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ default: 0 }) // thứ tự hiển thị
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
