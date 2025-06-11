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
  senderUser: User;

  @ManyToOne(() => User, (user) => user.receiver)
  @JoinColumn({ name: 'receiver_user_id' })
  receiverUser: User;

  @Column('text')
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
