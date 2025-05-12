import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Topic } from './topic.entity';

@Entity('flashcards')
export class Flashcard {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Topic, (topic) => topic.flashcards)
  topic: Topic;

  @Column('text')
  front_text: string;

  @Column('text')
  back_text: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
