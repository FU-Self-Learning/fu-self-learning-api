import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('social_interactions')
export class SocialInteraction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sender)
  @JoinColumn({ name: 'sender_user_id' })
  sender_user: User;

  @ManyToOne(() => User, (user) => user.receiver)
  @JoinColumn({ name: 'receiver_user_id' })
  receiver_user: User;

  @Column('text')
  message: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
