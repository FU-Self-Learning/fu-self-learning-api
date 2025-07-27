import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Column } from 'typeorm';
import { GroupChat } from './group-chat.entity';
import { User } from './user.entity';

@Entity('group_member')
export class GroupMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => GroupChat, { nullable: false })
  group: GroupChat;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column({ default: 'member' })
  role: string;

  @CreateDateColumn()
  joinedAt: Date;
}
