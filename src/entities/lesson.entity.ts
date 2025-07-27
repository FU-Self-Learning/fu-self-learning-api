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
import { VideoProgress } from './video-progress.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Topic, (topic) => topic.lessons)
  topic: Topic;

  @OneToMany(() => Flashcard, (flashcard) => flashcard.lesson)
  flashcards: Flashcard[];

  @OneToMany(() => VideoProgress, (progress) => progress.lesson)
  videoProgress: VideoProgress[];

  @Column()
  title: string;

  @Column({ nullable: true })
  videoUrl?: string;

  @Column({ nullable: true })
  videoDuration?: number;

  @Column('text')
  description: string;

  @Column({ default: 0 }) // thứ tự hiển thị
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
