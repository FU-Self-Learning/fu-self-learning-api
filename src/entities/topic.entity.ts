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

  @Column()
  title: string;

  @Column('text')
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
