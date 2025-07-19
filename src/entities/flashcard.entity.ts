import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Topic } from './topic.entity';
import { Lesson } from './lesson.entity';
import { Course } from './course.entity';
import { StudySet } from './study-set.entity';

@Entity('flashcards')
export class Flashcard {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Topic, (topic) => topic.flashcards, { nullable: true })
  topic: Topic;

  @ManyToOne(() => Lesson, (lesson) => lesson.flashcards, { nullable: true })
  lesson: Lesson;

  @ManyToOne(() => Course, (course) => course.flashcards, { nullable: true })
  course: Course;

  @Column('text')
  front_text: string;

  @Column('text')
  back_text: string;

  @Column({ default: false })
  is_auto_generated: boolean;

  @Column({ nullable: true })
  generation_source: string; // 'lesson', 'topic', 'course'

  @ManyToOne(() => StudySet, (studySet) => studySet.flashcards, {
    nullable: true,
  })
  studySet: StudySet;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
