import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Topic } from './topic.entity';
import { User } from './user.entity';

@Entity('ai_content_requests')
export class AIContentRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.aiContentRequests)
  user: User;

  @ManyToOne(() => Topic, (topic) => topic.aiContentRequests)
  topic: Topic;
  
  @Column({ type: 'enum', enum: ['flashcard', 'quiz'] })
  request_type: 'flashcard' | 'quiz';

  @Column('text')
  prompt: string;

  @Column({ type: 'enum', enum: ['pending', 'completed', 'failed'] })
  status: 'pending' | 'completed' | 'failed';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
