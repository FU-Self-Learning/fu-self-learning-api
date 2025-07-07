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
import { Flashcard } from './flashcard.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Topic, (topic) => topic.lessons)
  topic: Topic;

  @OneToMany(() => Flashcard, (flashcard) => flashcard.lesson)
  flashcards: Flashcard[];

  @Column()
  title: string;

  @Column({ nullable: true })
  videoUrl?: string;

  @Column({ nullable: true })
  videoDuration?: number;

  @Column('text')
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
