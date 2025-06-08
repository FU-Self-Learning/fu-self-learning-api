import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Topic } from './topic.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Topic, (topic) => topic.lessons)
  topic: Topic;

  @Column()
  title: string;

  @Column()
  videoUrl: string;

  @Column()
  videoDuration: number;

  @Column('text')
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
