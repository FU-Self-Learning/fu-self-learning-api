import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { GroupChat } from './group-chat.entity';
import { User } from './user.entity';

@Entity('group_message')
export class GroupMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => GroupChat, { nullable: false })
  group: GroupChat;

  @ManyToOne(() => User, { nullable: false })
  sender: User;

  @Column('text')
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
