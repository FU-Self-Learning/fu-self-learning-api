import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Course } from './course.entity';
import { User } from './user.entity';

@Entity('group_chat')
export class GroupChat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @ManyToOne(() => Course, { nullable: false })
  course: Course;

  @ManyToOne(() => User, { nullable: false })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;
  
  @Column({ default: false })
  isCommunity: boolean;
}
