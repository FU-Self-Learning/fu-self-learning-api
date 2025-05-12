import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Topic } from './topic.entity';
import { User } from './user.entity';

@Entity('study_sessions')
export class StudySession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.studySessions)
  user: User;

  @ManyToOne(() => Topic, (topic) => topic.studySessions)
  topic: Topic;

  @Column()
  started_at: Date;

  @Column({ nullable: true })
  completed_at: Date;
}
